import type {PluginConfig} from 'svgo';

import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import {optimize} from 'svgo';

// eslint-disable-next-line import/extensions -- relative imports require an explicit extension under Node's ESM resolution (this file is real ESM, see the .mts extension)
import GithubUtils from '../.github/libs/GithubUtils.js';

type CompressionResult = {
    filePath: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
};

type CompressionSummary = {
    totalFiles: number;
    totalCompressedFilesLength: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    totalSavingsPercent: number;
    results: CompressionResult[];
    ignoredFiles: string[];
};

// Suffix for files to be ignored from compression eg. file-ignore-compression.svg
const IGNORE_SUFFIX = '-ignore-compression';

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

function compressSvgFile(filePath: string, isSavingFile: boolean): CompressionResult {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    try {
        let currentContent = originalContent;
        let currentSize = originalSize;
        let totalSavings = 0;
        // Perform 5 iterations, as additional savings could be gained with another pass (2–3 are usually enough).
        // For checking if file is compressed, we only need to run once.
        const maxPasses = isSavingFile ? 5 : 1;

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

        if (isSavingFile) {
            fs.writeFileSync(filePath, currentContent, 'utf8');
        }

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

    if (errors.length) {
        console.error('Validation errors:');
        for (const error of errors) {
            console.error(`   ${error}`);
        }
        throw new Error('SVG file validation failed');
    }

    return validFiles;
}

function createResultsSummary(results: CompressionResult[], ignoredFiles: string[] = []): CompressionSummary {
    const compressedFiles = results.filter((r) => !!r.savings);

    const totalCompressedFilesLength = compressedFiles.length;
    const totalOriginalSize = compressedFiles.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = compressedFiles.reduce((sum, r) => sum + r.compressedSize, 0);
    const totalSavings = compressedFiles.reduce((sum, r) => sum + r.savings, 0);
    const totalSavingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;

    return {
        totalFiles: results.length + ignoredFiles.length,
        totalCompressedFilesLength,
        totalOriginalSize,
        totalCompressedSize,
        totalSavings,
        totalSavingsPercent,
        results,
        ignoredFiles,
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

function logIgnoredFiles(ignoredFiles: string[]) {
    if (!ignoredFiles.length) {
        return;
    }

    console.log('\nFiles skipped (ignore-compression):');
    for (const filePath of ignoredFiles) {
        console.log(`${filePath}: ⏭️  Skipped`);
    }
}

function logSummary(summary: CompressionSummary) {
    const {totalFiles, totalCompressedFilesLength, totalOriginalSize, totalCompressedSize, totalSavings, totalSavingsPercent, results, ignoredFiles} = summary;

    logIgnoredFiles(ignoredFiles);

    if (totalCompressedFilesLength) {
        console.log('\nFiles compressed:');
        for (const result of results) {
            const {compressedSize, originalSize, savings, savingsPercent, filePath} = result;
            if (!result.savings) {
                continue;
            }
            const prefix = `${filePath}: ✅`;
            console.log(
                getSummarySavingString({
                    prefix,
                    compressedSize,
                    originalSize,
                    savings,
                    savingsPercent,
                }),
            );
        }

        const ignoreFilesLength = ignoredFiles.length;

        console.log(`\nFiles processed: ${totalFiles}`);
        console.log(`Files already properly compressed: ${totalFiles - ignoreFilesLength - totalCompressedFilesLength}`);
        console.log(`Files compressed: ${totalCompressedFilesLength}`);
        console.log(`Files ignored: ${ignoreFilesLength}`);
        console.log(
            getSummarySavingString({
                prefix: 'Savings:',
                originalSize: totalOriginalSize,
                compressedSize: totalCompressedSize,
                savings: totalSavings,
                savingsPercent: totalSavingsPercent,
            }),
        );
    } else {
        console.log('\n✅ All files already compressed');
    }
}

function logSummaryCheck(summary: CompressionSummary) {
    const {totalFiles, totalCompressedFilesLength, results, ignoredFiles} = summary;

    console.log('');
    for (const result of results) {
        const {filePath, savings} = result;
        console.log(`${filePath}: ${savings > 0 ? 'Not properly compressed ❌' : 'Compressed ✅'}`);
    }
    logIgnoredFiles(ignoredFiles);

    console.log(`\nFiles processed: ${totalFiles}`);
    console.log(`Files ignored: ${ignoredFiles.length}`);
    console.log(`Files not properly compressed: ${totalCompressedFilesLength}`);
}

function processFiles(svgFiles: string[], isSavingFile: boolean): CompressionResult[] {
    const results: CompressionResult[] = [];
    for (const file of svgFiles) {
        const result = compressSvgFile(file, isSavingFile);
        results.push(result);
    }
    return results;
}

function compressSvgFiles(regularSvgFiles: string[], ignoredFiles: string[] = []) {
    console.log(`🚀 Starting compression ${regularSvgFiles.length} SVG file(s)`);
    const results = processFiles(regularSvgFiles, true);
    const summary = createResultsSummary(results, ignoredFiles);
    logSummary(summary);
    return summary;
}

function checkCompressedSvgFiles(regularSvgFiles: string[], ignoredFiles: string[] = []) {
    console.log(`🚀 Checking if all SVG files are compressed...`);
    const results = processFiles(regularSvgFiles, false);
    const summary = createResultsSummary(results, ignoredFiles);
    logSummaryCheck(summary);
    return summary;
}

async function getChangedSvgFilesFromGithub(): Promise<string[]> {
    try {
        const pullRequestNumber = github.context.payload.pull_request?.number;

        if (!pullRequestNumber) {
            console.log('No pull request number found');
            return [];
        }

        const changedFiles = await GithubUtils.getPullRequestChangedSVGFileNames(pullRequestNumber);

        const svgFiles = changedFiles
            .filter((file) => path.extname(file.toLowerCase()) === '.svg')
            .map((file) => path.resolve(file))
            .filter((file) => fs.existsSync(file));

        console.log(`Found ${svgFiles.length} changed SVG file(s) in PR`);
        return svgFiles;
    } catch (error) {
        console.error('❌ Error getting files from GitHub:', error);
        return [];
    }
}

function splitFilesBySuffix(files: string[]): {regular: string[]; ignored: string[]} {
    const regularFiles: string[] = [];
    const ignoredFiles: string[] = [];

    for (const file of files) {
        const fileName = path.basename(file);
        if (fileName.endsWith(`${IGNORE_SUFFIX}.svg`)) {
            ignoredFiles.push(file);
        } else {
            regularFiles.push(file);
        }
    }

    return {regular: regularFiles, ignored: ignoredFiles};
}

async function run(mode: 'directory' | 'files' | 'pullRequest', options?: {targetDir?: string; filePaths?: string[]; token?: string}): Promise<CompressionSummary> {
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

            const {regular: regularSvgFiles, ignored: ignoredFiles} = splitFilesBySuffix(svgFiles);

            return compressSvgFiles(regularSvgFiles, ignoredFiles);
        }

        case 'files': {
            if (!options?.filePaths?.length) {
                throw new Error('filePaths is required for files mode');
            }
            const svgFiles = validateSvgFiles(options.filePaths);

            if (!svgFiles.length) {
                console.log('❌ No valid SVG files provided.');
            }

            const {regular: regularSvgFiles, ignored: ignoredFiles} = splitFilesBySuffix(svgFiles);

            return compressSvgFiles(regularSvgFiles, ignoredFiles);
        }

        case 'pullRequest': {
            const svgFiles = await getChangedSvgFilesFromGithub();
            if (!svgFiles.length) {
                console.log('❌ No changed SVG files found in Pull Request');
            }
            const {regular: regularSvgFiles, ignored: ignoredFiles} = splitFilesBySuffix(svgFiles);

            return checkCompressedSvgFiles(regularSvgFiles, ignoredFiles);
        }

        default:
            throw new Error(`Unknown compression mode: ${mode as string}`);
    }
}

export default run;
export {type CompressionSummary};
