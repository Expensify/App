#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import type {PluginConfig} from 'svgo';
import {optimize} from 'svgo';

type CompressionResult = {
    filePath: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
};

type CompressionSummary = {
    totalFiles: number;
    totalFilesCompressed: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    totalSavingsPercent: number;
    results: CompressionResult[];
};

// SVGO Default plugins
const svgoConfig: {plugins: PluginConfig[]} = {
    plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeDeprecatedAttrs',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'mergeStyles',
        // 'inlineStyles', // Cause issues with fill on Android
        'minifyStyles',
        'cleanupIds',
        'removeUselessDefs',
        'cleanupNumericValues',
        'convertColors',
        'removeNonInheritableGroupAttrs',
        'removeUnknownsAndDefaults',
        'removeUselessStrokeAndFill',
        'cleanupEnableBackground',
        'removeHiddenElems',
        'removeEmptyText',
        'convertShapeToPath',
        'convertEllipseToCircle',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'convertPathData',
        'convertTransform',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'mergePaths',
        'removeUnusedNS',
        'sortAttrs',
        'sortDefsChildren',
        'removeDesc',
    ],
};

function findSvgFiles(dir: string): string[] {
    const svgFiles: string[] = [];

    function scanDirectory(currentDir: string) {
        const items = fs.readdirSync(currentDir, {withFileTypes: true});

        for (const item of items) {
            const fullPath = path.join(currentDir, item.name);

            if (item.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.svg') {
                svgFiles.push(fullPath);
            }
        }
    }

    scanDirectory(dir);
    return svgFiles;
}

function formatBytes(bytes: number): string {
    return (bytes / 1024).toFixed(2);
}

function compressSvgFile(filePath: string): CompressionResult {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    try {
        let currentContent = originalContent;
        let currentSize = originalSize;
        let totalSavings = 0;
        // Perform 5 iterations, as additional savings could be gained with another pass (2–3 are usually enough)
        const maxPasses = 5;

        for (let pass = 1; pass <= maxPasses; pass++) {
            const result = optimize(currentContent, {
                path: filePath,
                ...svgoConfig,
            });

            const compressedContent = result.data;
            const compressedSize = Buffer.byteLength(compressedContent, 'utf8');
            const passSavings = currentSize - compressedSize;

            if (passSavings <= 0) {
                break;
            }

            totalSavings += passSavings;
            currentContent = compressedContent;
            currentSize = compressedSize;

            if (pass === maxPasses || passSavings < 10) {
                break;
            }
        }

        const finalSavingsPercent = originalSize > 0 ? (totalSavings / originalSize) * 100 : 0;
        fs.writeFileSync(filePath, currentContent, 'utf8');

        return {
            filePath,
            originalSize,
            compressedSize: currentSize,
            savings: totalSavings,
            savingsPercent: finalSavingsPercent,
        };
    } catch (error) {
        console.error(`❌ Error compressing ${filePath}:`, error);
        return {
            filePath,
            originalSize,
            compressedSize: originalSize,
            savings: 0,
            savingsPercent: 0,
        };
    }
}

function validateSvgFiles(filePaths: string[]): string[] {
    const validFiles: string[] = [];
    const errors: string[] = [];

    for (const filePath of filePaths) {
        const resolvedPath = path.resolve(filePath);

        if (!fs.existsSync(resolvedPath)) {
            errors.push(`❌ File does not exist: ${filePath}`);
            continue;
        }

        const stat = fs.statSync(resolvedPath);
        if (!stat.isFile()) {
            errors.push(`❌ Not a file: ${filePath}`);
            continue;
        }

        if (path.extname(filePath).toLowerCase() !== '.svg') {
            errors.push(`❌ Not an SVG file: ${filePath}`);
            continue;
        }

        validFiles.push(resolvedPath);
    }

    if (errors.length > 0) {
        console.error('Validation errors:');
        errors.forEach((error) => console.error(`   ${error}`));
        throw new Error('SVG file validation failed');
    }

    return validFiles;
}

function createResultsSummary(results: CompressionResult[]): CompressionSummary {
    const totalFilesCompressed = results.filter((r) => !!r.savings).length;
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
    const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
    const totalSavingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;

    return {
        totalFiles: results.length,
        totalFilesCompressed,
        totalOriginalSize,
        totalCompressedSize,
        totalSavings,
        totalSavingsPercent,
        results,
    };
}

function getSummarySavingString({
    prefix,
    originalSize,
    compressedSize,
    savings,
    savingsPercent,
}: {
    prefix: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
}) {
    return `${prefix} ${formatBytes(originalSize)} KB → ${formatBytes(compressedSize)} KB | ${`${formatBytes(savings)} KB (${savingsPercent.toFixed(2)}%)`}`;
}

function logSummary(summary: CompressionSummary) {
    const {totalFiles, totalFilesCompressed, totalOriginalSize, totalCompressedSize, totalSavings, totalSavingsPercent, results} = summary;

    if (totalFilesCompressed) {
        console.log('\n📋 Individual file results:');
        results.forEach((result, index) => {
            const {compressedSize, originalSize, savings, savingsPercent, filePath} = result;
            if (!result.savings) {
                return;
            }
            const prefix = `${index + 1}. ${filePath}: ✅`;
            console.log(
                getSummarySavingString({
                    prefix,
                    compressedSize,
                    originalSize,
                    savings,
                    savingsPercent,
                }),
            );
        });
    } else {
        console.log('\n✅ All files already compressed');
    }

    console.log('\nCOMPRESSION SUMMARY');
    console.log(`Files processed: ${totalFiles}`);
    console.log(`Files compressed: ${totalFilesCompressed}`);
    console.log(
        getSummarySavingString({
            prefix: 'Savings:',
            originalSize: totalOriginalSize,
            compressedSize: totalCompressedSize,
            savings: totalSavings,
            savingsPercent: totalSavingsPercent,
        }),
    );
}

function processFiles(svgFiles: string[]): CompressionSummary {
    console.log(`🚀 Starting compression... ${svgFiles.length} SVG file(s)`);
    const results: CompressionResult[] = [];

    for (const file of svgFiles) {
        const result = compressSvgFile(file);
        results.push(result);
    }

    const summary = createResultsSummary(results);
    logSummary(summary);
    return summary;
}

function generateMarkdownSummary(summary: CompressionSummary): string {
    const {totalFiles, totalFilesCompressed, totalOriginalSize, totalCompressedSize, totalSavings, totalSavingsPercent, results} = summary;
    const markdown: string[] = [];

    markdown.push('## SVG Compression Summary\n');

    markdown.push(`Files processed: ${totalFiles}`);
    markdown.push(`Files compressed: ${totalFilesCompressed}`);
    markdown.push(`Original size: ${formatBytes(totalOriginalSize)} KB`);
    markdown.push(
        getSummarySavingString({
            prefix: 'Savings:',
            originalSize: totalOriginalSize,
            compressedSize: totalCompressedSize,
            savings: totalSavings,
            savingsPercent: totalSavingsPercent,
        }),
    );
    markdown.push('');

    if (results.length) {
        markdown.push('| File | Original | Compressed | Savings |');
        markdown.push('|------|----------|------------|---------|');

        results.forEach((result) => {
            const {originalSize, compressedSize, savings, savingsPercent, filePath} = result;
            const savingsText = savings > 0 ? `${formatBytes(savings)} KB (${savingsPercent.toFixed(1)}%)` : ' --';
            markdown.push(`| \`${filePath}\` | ${formatBytes(originalSize)} KB | ${formatBytes(compressedSize)} KB | ${savingsText} |`);
        });
    }

    markdown.push('');

    return markdown.join('\n');
}

function getFilesFromGithub(): string[] {
    try {
        console.log('Manual trigger: scanning all SVG files in assets directory');
        return findSvgFiles('assets');
    } catch (error) {
        console.error('❌ Error getting files from GitHub:', error);
        return [];
    }
}

function logHelp() {
    console.log('');
    console.log('Usage:');
    console.log('  Mode 1 - Directory scan:');
    console.log('    npm run compress-svg -- --dir assets/images');
    console.log('');
    console.log('  Mode 2 - Specific files:');
    console.log('    npm run compress-svg -- --files file1.svg file2.svg ...');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('  --dir         Compress all SVG files in specified directory');
    console.log('  --files       Compress specified SVG files');
    console.log('');
}

function run(mode: 'directory' | 'files' | 'github', options?: {targetDir?: string; filePaths?: string[]}): CompressionSummary {
    console.log('SVG Compression Tool');
    console.log('🔍 Searching for SVG files...');
    switch (mode) {
        case 'directory': {
            if (!options?.targetDir) {
                throw new Error('targetDir is required for directory mode');
            }

            const svgFiles = findSvgFiles(options.targetDir);

            if (!svgFiles.length) {
                console.log('❌ No SVG files found in the specified directory.');
            }

            return processFiles(svgFiles);
        }

        case 'files': {
            if (!options?.filePaths?.length) {
                throw new Error('filePaths is required for files mode');
            }
            const validatedFiles = validateSvgFiles(options.filePaths);

            if (!validatedFiles.length) {
                console.log('❌ No valid SVG files provided.');
            }

            return processFiles(validatedFiles);
        }

        case 'github': {
            const changedSvgFiles = getFilesFromGithub();

            if (changedSvgFiles.length === 0) {
                console.log('❌ No changed SVG files found.');
            }

            return processFiles(changedSvgFiles);
        }

        default:
            throw new Error(`Unknown compression mode: ${mode as string}`);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const firstArg = args.at(0);

    if (firstArg === '--help' || firstArg === '-h') {
        logHelp();
        process.exit(0);
    }

    if (firstArg === '--dir' || firstArg === '-d') {
        const targetDir = args.at(1);

        if (!targetDir) {
            console.error('❌ No directory specified after --dir flag');
            console.log('');
            logHelp();
            process.exit(1);
        }

        if (!fs.existsSync(targetDir)) {
            console.error(`❌ Directory '${targetDir}' does not exist.`);
            process.exit(1);
        }

        const stat = fs.statSync(targetDir);
        if (!stat.isDirectory()) {
            console.error(`❌ '${targetDir}' is not a directory.`);
            console.log('Use --files flag to compress specific files');
            process.exit(1);
        }

        console.log(`Target directory: ${path.resolve(targetDir)}`);

        try {
            run('directory', {targetDir});
            console.log('\n✅ SVG compression completed successfully');
            process.exit(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Fatal error: ${errorMessage}`);
            process.exit(1);
        }
    } else if (firstArg === '--files' || firstArg === '-f') {
        if (args.length < 2) {
            console.error('❌ No files specified after --files flag');
            console.log('');
            logHelp();
            process.exit(1);
        }

        const filePaths = args.slice(1);
        console.log(`Specific files (${filePaths.length} files provided)`);

        try {
            run('files', {filePaths});
            console.log('\n✅ SVG compression completed successfully');
            process.exit(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Fatal error: ${errorMessage}`);
            process.exit(1);
        }
    }
    // No arguments provided - show help
    else {
        logHelp();
        process.exit(0);
    }
}

export default run;
export {generateMarkdownSummary, getFilesFromGithub, type CompressionSummary, type CompressionResult};
