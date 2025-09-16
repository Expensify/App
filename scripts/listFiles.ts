// Usage examples:
//   - npx ts-node scripts/listFiles.ts
//   - npx ts-node scripts/listFiles.ts --type svg --limit 20 --basePattern assets
//   - npx ts-node scripts/listFiles.ts --type svg --limit 1000 --basePattern assets --prepareSvgArray
import {promises as fs} from 'fs';
import {glob} from 'glob';
import path from 'path';
import CLI from './utils/CLI';
import * as Logger from './utils/Logger';

const customTypePatterns = {
    all: '',
    images: '.{svg,png,jpg,jpeg}',
};

const defaultBasePattern = '{assets,src}';
type File = {
    path: string;
    name: string;
    sizeBytes: number;
    type: string;
};

function isTypeValid(type: string): type is keyof typeof customTypePatterns {
    return type in customTypePatterns;
}

const cli = new CLI({
    namedArgs: {
        type: {description: `File type to search. Custom types are: ${Object.keys(customTypePatterns).join(', ')}`, default: 'all'},
        limit: {description: 'Limit number of results printed', default: 30, parse: (v: string) => Number(v)},
        basePattern: {description: `Base pattern to search in`, default: defaultBasePattern},
    },
    flags: {
        copyFiles: {description: 'Copy files to root directory'},
        withOriginalDir: {description: 'Use original directory structure in destination path when copying files'},
        prepareSvgArray: {description: 'Generate svgAssets.ts file in root directory with SVG imports and array'},
    },
});

function formatKiB(bytes: number): string {
    const kib = bytes / 1024;
    return `${kib.toFixed(2)} KiB`;
}

async function getFileSizeBytes(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath);
    return stat.size;
}

function logTable(files: File[], totalFilesLength: number, totalSizeBytes: number) {
    const positionColHeader = 'Pos';
    const sizeColHeader = 'Size';
    const typeColHeader = 'Type';
    const nameColHeader = 'Name';
    const pathColHeader = 'Path';
    const positionColWidth = 5;
    const sizeColWidth = 12;
    const typeColWidth = 8;
    const nameColWidth = 50;

    const header = `${positionColHeader.padEnd(positionColWidth)}  ${sizeColHeader.padEnd(sizeColWidth)} ${typeColHeader.padEnd(typeColWidth)} ${nameColHeader.padEnd(nameColWidth)} ${pathColHeader}`;
    Logger.log('');
    Logger.log('Summary:');
    Logger.log('--------------------------------');
    Logger.log(`Total files: ${totalFilesLength}`);
    Logger.log(`Total size: ${formatKiB(totalSizeBytes)}`);
    Logger.log('--------------------------------');
    Logger.log('');

    Logger.log(header);
    Logger.log('-'.repeat(header.length));

    for (const [index, item] of files.entries()) {
        const positionStr = (index + 1).toString().padEnd(positionColWidth);
        const sizeStr = formatKiB(item.sizeBytes).padEnd(sizeColWidth);
        const typeStr = item.type.padEnd(typeColWidth);
        const nameStr = item.name.padEnd(nameColWidth);
        Logger.log(`${positionStr}  ${sizeStr} ${typeStr} ${nameStr} ${item.path}`);
    }

    const selectedFilesLength = files.length;
    if (selectedFilesLength < totalFilesLength) {
        const selectedFilesSizeBytes = files.map((file) => file.sizeBytes).reduce((a, b) => a + b, 0);
        const remainingSizeBytes = totalSizeBytes - selectedFilesSizeBytes;
        Logger.log('');
        Logger.log(`... and ${totalFilesLength - selectedFilesLength} more files (${formatKiB(remainingSizeBytes)})`);
    }

    Logger.log('');
    Logger.success('Files analysis complete.');
}

const copyFiles = async (selectedFiles: File[], root: string, withOriginalDir: boolean) => {
    Logger.info('Copying files to root directory...');
    const destDir = path.join(root, 'copied files');
    try {
        await fs.mkdir(destDir, {recursive: true});
        await Promise.all(
            selectedFiles.map(async (file) => {
                if (withOriginalDir) {
                    const destPath = path.join(destDir, file.path);
                    await fs.mkdir(path.dirname(destPath), {recursive: true});
                    return fs.copyFile(file.path, destPath);
                }
                return fs.copyFile(file.path, path.join(destDir, file.name));
            }),
        );
        Logger.success('Files copied to root directory.');
    } catch (e) {
        Logger.error('Failed to copy files:', e);
    }
};

// Function to convert filename to PascalCase component name
function filenameToComponentName(filename: string, index: number): string {
    // Remove .svg extension
    const name = filename.replace('.svg', '');

    const nameTransformed =
        name
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('')
            .replace(/[^a-zA-Z0-9]/g, '') + (index + 1).toString();

    // Convert kebab-case and snake_case to PascalCase
    return nameTransformed;
}

// Function to generate SVG assets TypeScript file
const generateSvgAssetsFile = async (svgFiles: File[], root: string) => {
    Logger.info('Generating svgAssets.ts file...');

    try {
        const importStatements: string[] = [];
        const entries: string[] = [];

        svgFiles.forEach((file, index) => {
            const position = index + 1;
            const componentName = filenameToComponentName(file.name, index);
            const assetPath = file.path.replace(/\\/g, '/'); // Normalize path separators

            entries.push(`    {position: ${position}, name: '${file.name}', component: ${componentName}},`);
            importStatements.push(`import ${componentName} from '@${assetPath}';`);
        });

        // Generate the complete TypeScript file content
        const fileContent = `// Auto-generated SVG assets file
// Generated by: npx ts-node scripts/listFiles.ts --type svg --prepareSvgArray
/* eslint-disable rulesdir/no-inline-named-export */
// Total SVG files: ${svgFiles.length}

${importStatements.join('\n')}

export type SVGItem = {
    position: number;
    name: string;
    component: React.ComponentType;
};

// Complete SVG items array (${svgFiles.length} total)
export const svgItems: SVGItem[] = [
${entries.join('\n')}
];

export default svgItems;
`;

        const filePath = path.join(root, 'svgAssets.ts');
        await fs.writeFile(filePath, fileContent, 'utf8');

        Logger.success(`SVG assets file created: ${filePath}`);
        Logger.info(`Generated ${svgFiles.length} SVG imports and entries.`);
    } catch (e) {
        Logger.error('Failed to generate SVG assets file:', e);
    }
};

async function main(): Promise<void> {
    const root = process.cwd();

    const type = cli.namedArgs.type;
    const suffix = isTypeValid(type) ? customTypePatterns[type] : type;
    const pattern = `${cli.namedArgs.basePattern}/**/*.${suffix}`;

    Logger.info('Scanning for files. Pattern:', pattern);
    const filesRaw = await glob(pattern, {cwd: root, nodir: true, absolute: true});

    if (!filesRaw.length) {
        Logger.warn('No files found.');
        return;
    }

    let totalSizeBytes = 0;
    const files: File[] = [];
    await Promise.all(
        filesRaw.map(async (filePath) => {
            try {
                const sizeBytes = await getFileSizeBytes(filePath);
                const fileType = path.extname(filePath).slice(1).toLowerCase();
                files.push({
                    path: path.relative(root, filePath),
                    name: path.basename(filePath),
                    sizeBytes,
                    type: fileType,
                });
                totalSizeBytes += sizeBytes;
            } catch (e) {
                Logger.warn('Failed to stat file, skipping:', filePath, e);
            }
        }),
    );

    files.sort((a, b) => b.sizeBytes - a.sizeBytes);

    const limit = Number.isFinite(cli.namedArgs.limit) ? cli.namedArgs.limit : files.length;
    const selectedFiles = limit ? files.slice(0, limit) : files;

    logTable(selectedFiles, files.length, totalSizeBytes);

    if (cli.flags.copyFiles) {
        await copyFiles(selectedFiles, root, cli.flags.withOriginalDir);
    }

    if (cli.flags.prepareSvgArray) {
        // Filter for SVG files only
        const svgFiles = files.filter((file) => file.type === 'svg');

        if (svgFiles.length === 0) {
            Logger.warn('No SVG files found to generate assets file.');
            return;
        }

        await generateSvgAssetsFile(svgFiles, root);
    }
}

main().catch((err) => {
    Logger.error('Failed to list files:', err);
    process.exit(1);
});
