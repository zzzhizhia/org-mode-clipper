// Browser globals (DOMParser, window, document) are provided by the esbuild
// banner in scripts/build-cli.mjs. They must run before any bundled module code.
import { parseHTML } from 'linkedom';
import { clip, matchTemplate, DocumentParser } from './api';
import { denoteFilename } from './utils/denote';
import { Template } from './types/types';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CliArgs {
	url: string;
	templatePath: string;
	outputPath?: string;
	outputDir?: string;
	propertyTypesPath?: string;
	htmlPath?: string;
}

function printUsage(): void {
	const usage = `
Usage: org-clipper <url> [options]

Options:
  -t, --template <path>        Path to template JSON file or directory (required)
                               If a directory, auto-matches template by URL triggers
  -o, --output <path>          Output file path (default: stdout)
  -d, --output-dir <path>      Output directory; filename is auto-generated using
                               Denote naming (YYYYMMDDTHHMMSS--slug__tags.org)
      --html <path>            Read HTML from file instead of fetching URL (use - for stdin)
      --property-types <path>  JSON mapping property names to types
  -h, --help                   Show this help message
`.trim();
	console.log(usage);
}

function parseArgs(argv: string[]): CliArgs {
	const args = argv.slice(2);
	let url = '';
	let templatePath = '';
	let outputPath: string | undefined;
	let outputDir: string | undefined;
	let propertyTypesPath: string | undefined;
	let htmlPath: string | undefined;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case '-h':
			case '--help':
				printUsage();
				process.exit(0);
			case '-t':
			case '--template':
				if (i + 1 >= args.length) { console.error('Error: --template requires a value'); process.exit(1); }
				templatePath = args[++i];
				break;
			case '-o':
			case '--output':
				if (i + 1 >= args.length) { console.error('Error: --output requires a value'); process.exit(1); }
				outputPath = args[++i];
				break;
			case '-d':
			case '--output-dir':
				if (i + 1 >= args.length) { console.error('Error: --output-dir requires a value'); process.exit(1); }
				outputDir = args[++i];
				break;
			case '--html':
				if (i + 1 >= args.length) { console.error('Error: --html requires a value'); process.exit(1); }
				htmlPath = args[++i];
				break;
			case '--property-types':
				if (i + 1 >= args.length) { console.error('Error: --property-types requires a value'); process.exit(1); }
				propertyTypesPath = args[++i];
				break;
			default:
				if (!arg.startsWith('-') && !url) {
					url = arg;
				} else {
					console.error(`Unknown option: ${arg}`);
					printUsage();
					process.exit(1);
				}
		}
	}

	if (!url) {
		console.error('Error: URL is required');
		printUsage();
		process.exit(1);
	}

	if (!templatePath) {
		console.error('Error: --template is required');
		printUsage();
		process.exit(1);
	}

	return { url, templatePath, outputPath, outputDir, propertyTypesPath, htmlPath };
}

// ---------------------------------------------------------------------------
// Template loading
// ---------------------------------------------------------------------------

const templateFilePaths = new Map<Template, string>();

function loadTemplatesFromDir(dirPath: string): Template[] {
	const resolved = path.resolve(dirPath);
	const files = fs.readdirSync(resolved).filter(f => f.endsWith('.json'));
	return files.map(f => {
		const raw = fs.readFileSync(path.join(resolved, f), 'utf-8');
		const template: Template = JSON.parse(raw);
		templateFilePaths.set(template, path.join(resolved, f));
		return template;
	});
}

// ---------------------------------------------------------------------------
// linkedom-based DocumentParser for the API
// ---------------------------------------------------------------------------

const linkedomParser: DocumentParser = {
	parseFromString(html: string, _mimeType: string) {
		return parseHTML(html).document;
	}
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const args = parseArgs(process.argv);

	const resolvedTemplatePath = path.resolve(args.templatePath);
	const isDir = fs.statSync(resolvedTemplatePath).isDirectory();
	let templates: Template[] | undefined;
	let template: Template | undefined;

	if (isDir) {
		templates = loadTemplatesFromDir(resolvedTemplatePath);
		if (templates.length === 0) {
			console.error(`Error: No .json template files found in ${args.templatePath}`);
			process.exit(1);
		}
	} else {
		const templateRaw = fs.readFileSync(resolvedTemplatePath, 'utf-8');
		template = JSON.parse(templateRaw);
	}

	let propertyTypes: Record<string, string> | undefined;
	if (args.propertyTypesPath) {
		const raw = fs.readFileSync(path.resolve(args.propertyTypesPath), 'utf-8');
		propertyTypes = JSON.parse(raw);
	}

	let html: string;
	if (args.htmlPath) {
		if (args.htmlPath === '-') {
			html = fs.readFileSync(0, 'utf-8');
		} else {
			html = fs.readFileSync(path.resolve(args.htmlPath), 'utf-8');
		}
	} else {
		const response = await fetch(args.url);
		if (!response.ok) {
			console.error(`Failed to fetch ${args.url}: ${response.status} ${response.statusText}`);
			process.exit(1);
		}
		html = await response.text();
	}

	let parsedDocument: any;
	if (templates) {
		let matched = matchTemplate(templates, args.url);

		if (!matched) {
			const hasSchemaTrigs = templates.some(t => t.triggers?.some(tr => tr.startsWith('schema:')));
			if (hasSchemaTrigs) {
				const DefuddleClass = (await import('defuddle')).default;
				parsedDocument = linkedomParser.parseFromString(html, 'text/html');
				const defuddle = new DefuddleClass(parsedDocument as unknown as Document, { url: args.url });
				const defuddleResult = defuddle.parse();
				matched = matchTemplate(templates, args.url, defuddleResult.schemaOrgData);
			}
		}

		if (!matched) {
			console.error(`Error: No template matched URL ${args.url}`);
			console.error(`Searched ${templates.length} templates in ${args.templatePath}`);
			process.exit(1);
		}
		template = matched;
		console.error(`Matched template: ${templateFilePaths.get(template) || 'unknown'}`);
	}

	if (!template) {
		console.error('Error: No template resolved');
		process.exit(1);
	}

	const result = await clip({
		html,
		url: args.url,
		template,
		documentParser: linkedomParser,
		propertyTypes,
		parsedDocument,
	});

	if (args.outputDir) {
		const filename = denoteFilename({ title: result.noteName, tags: ['clip'], date: new Date() });
		const outPath = path.join(path.resolve(args.outputDir), filename);
		fs.writeFileSync(outPath, result.fullContent, 'utf-8');
		console.error(`Written to ${outPath}`);
	} else if (args.outputPath) {
		fs.writeFileSync(path.resolve(args.outputPath), result.fullContent, 'utf-8');
		console.error(`Written to ${args.outputPath}`);
	} else {
		process.stdout.write(result.fullContent);
	}
}

main().catch(err => {
	console.error(err.message || err);
	process.exit(1);
});
