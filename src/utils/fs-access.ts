// File System Access API helpers.
//
// Directory handles are persisted in IndexedDB keyed by the directory's own
// name (as shown to the user). Permission may need to be re-granted after a
// browser restart; we handle that with queryPermission/requestPermission.

const DB_NAME = 'org-clipper';
const DB_VERSION = 1;
const STORE_NAME = 'save-dirs';

export function hasFSAccess(): boolean {
	return typeof (window as any).showDirectoryPicker === 'function';
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function dbGet(name: string): Promise<FileSystemDirectoryHandle | undefined> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const req = tx.objectStore(STORE_NAME).get(name);
		req.onsuccess = () => resolve(req.result as FileSystemDirectoryHandle | undefined);
		req.onerror = () => reject(req.error);
	});
}

async function dbPut(name: string, handle: FileSystemDirectoryHandle): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(handle, name);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function dbDelete(name: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).delete(name);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function dbKeys(): Promise<string[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const req = tx.objectStore(STORE_NAME).getAllKeys();
		req.onsuccess = () => resolve(req.result as string[]);
		req.onerror = () => reject(req.error);
	});
}

/**
 * Prompt the user to pick a directory. Stores the resulting handle in
 * IndexedDB under the directory's own name. Returns the name on success,
 * or null if the user cancelled.
 */
export async function pickSaveDirectory(): Promise<string | null> {
	if (!hasFSAccess()) {
		throw new Error('File System Access API not supported in this browser');
	}
	try {
		const handle = await (window as any).showDirectoryPicker({
			id: 'org-clipper-save',
			mode: 'readwrite',
			startIn: 'documents',
		}) as FileSystemDirectoryHandle;
		await dbPut(handle.name, handle);
		return handle.name;
	} catch (err) {
		// AbortError when user cancels the picker
		if (err instanceof DOMException && err.name === 'AbortError') {
			return null;
		}
		throw err;
	}
}

export async function listSaveDirectories(): Promise<string[]> {
	try {
		return await dbKeys();
	} catch {
		return [];
	}
}

export async function removeSaveDirectory(name: string): Promise<void> {
	await dbDelete(name);
}

async function ensurePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
	const opts = { mode: 'readwrite' as const };
	const current = await (handle as any).queryPermission(opts);
	if (current === 'granted') return true;
	const requested = await (handle as any).requestPermission(opts);
	return requested === 'granted';
}

/**
 * Write a file to the named save directory. Creates the file if missing,
 * overwrites if present. Returns true on success, false when no handle is
 * registered under that name or permission was denied.
 */
export async function writeFileToSaveDirectory(
	dirName: string,
	fileName: string,
	content: string
): Promise<boolean> {
	const handle = await dbGet(dirName);
	if (!handle) return false;
	if (!(await ensurePermission(handle))) return false;

	const fileHandle = await handle.getFileHandle(fileName, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(content);
	await writable.close();
	return true;
}
