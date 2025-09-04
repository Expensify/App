import * as core from '@actions/core';
import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {optimize} from 'svgo';
import {getStringInput} from '../../../libs/ActionUtils';
import CONST from '../../../libs/CONST';

interface CompressionResult {
    filePath: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
}

interface CompressionSummary {
    totalFiles: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    totalSavingsPercent: number;
    results: CompressionResult[];
}

// SVGO configuration for optimal compression
// Using simple config to avoid TypeScript issues - can be extended with input parameters
const svgoConfig = {};

/**
 * Recursively find all SVG files in a directory
 */
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

/**
 * Format bytes to KB with 2 decimal places
 */
function formatBytes(bytes: number): string {
    return (bytes / 1024).toFixed(2);
}

/**
 * Compress a single SVG file
 */
async function compressSvgFile(filePath: string): Promise<CompressionResult> {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');

    try {
        const result = optimize(originalContent, {
            path: filePath,
            ...svgoConfig,
        });

        const compressedContent = result.data;
        const compressedSize = Buffer.byteLength(compressedContent, 'utf8');
        const savings = originalSize - compressedSize;
        const savingsPercent = originalSize > 0 ? (savings / originalSize) * 100 : 0;

        // Write the compressed content back to the file
        fs.writeFileSync(filePath, compressedContent, 'utf8');

        return {
            filePath,
            originalSize,
            compressedSize,
            savings,
            savingsPercent,
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

/**
 * Validate that all provided file paths exist and are SVG files
 */
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
        process.exit(1);
    }

    return validFiles;
}

/**
 * Get target directory from GitHub Actions inputs or use default
 */
function getTargetDirectory(): string {
    const defaultDirectory = 'assets';
    return getStringInput('target-directory', {required: false}, defaultDirectory) ?? defaultDirectory;
}

/**
 * Main compression function for directory scanning
 */
async function compressSvgsFromDirectory(targetDir?: string): Promise<CompressionSummary> {
    const directory = targetDir || getTargetDirectory();
    console.log('🔍 Searching for SVG files...\n');

    const svgFiles = findSvgFiles(directory);

    if (svgFiles.length === 0) {
        console.log('❌ No SVG files found in the specified directory.');
        return {
            totalFiles: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalSavings: 0,
            totalSavingsPercent: 0,
            results: [],
        };
    }

    return await processFiles(svgFiles);
}

/**
 * Main compression function for specific file list
 */
async function compressSvgsFromList(filePaths: string[]): Promise<CompressionSummary> {
    console.log('🔍 Validating provided SVG files...\n');

    const validatedFiles = validateSvgFiles(filePaths);

    if (validatedFiles.length === 0) {
        console.log('❌ No valid SVG files provided.');
        return {
            totalFiles: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalSavings: 0,
            totalSavingsPercent: 0,
            results: [],
        };
    }

    return await processFiles(validatedFiles);
}

/**
 * Process and compress a list of SVG files
 */
async function processFiles(svgFiles: string[]): Promise<CompressionSummary> {
    // Display files that will be compressed
    console.log(`📋 Found ${svgFiles.length} SVG file(s) to compress:`);
    svgFiles.forEach((file, index) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`   ${index + 1}. ${relativePath}`);
    });
    console.log('');

    // Compress all files
    console.log('🚀 Starting compression...\n');
    const results: CompressionResult[] = [];

    for (let index = 0; index < svgFiles.length; index++) {
        const file = svgFiles[index];
        const relativePath = path.relative(process.cwd(), file);
        console.log(`   Processing ${index + 1}/${svgFiles.length}: ${relativePath}`);

        const result = await compressSvgFile(file);
        results.push(result);
    }

    // Calculate summary
    const summary: CompressionSummary = {
        totalFiles: results.length,
        totalOriginalSize: results.reduce((sum, r) => sum + r.originalSize, 0),
        totalCompressedSize: results.reduce((sum, r) => sum + r.compressedSize, 0),
        totalSavings: results.reduce((sum, r) => sum + r.savings, 0),
        totalSavingsPercent: 0,
        results,
    };

    summary.totalSavingsPercent = summary.totalOriginalSize > 0 ? (summary.totalSavings / summary.totalOriginalSize) * 100 : 0;

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPRESSION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📁 Total files processed: ${summary.totalFiles}`);
    console.log(`📦 Original total size: ${formatBytes(summary.totalOriginalSize)} KB`);
    console.log(`🗜️ Compressed total size: ${formatBytes(summary.totalCompressedSize)} KB`);
    console.log(`💾 Total savings: ${formatBytes(summary.totalSavings)} KB`);
    console.log(`📈 Total savings: ${summary.totalSavingsPercent.toFixed(2)}%`);
    console.log('='.repeat(60));

    // Display individual file results
    console.log('\n📋 Individual file results:');
    results.forEach((result, index) => {
        const relativePath = path.relative(process.cwd(), result.filePath);
        const savingsDisplay = result.savings > 0 ? `💾 ${formatBytes(result.savings)} KB (${result.savingsPercent.toFixed(2)}%)` : '❌ No savings';

        console.log(`   ${index + 1}. ${relativePath}`);
        console.log(`      ${formatBytes(result.originalSize)} KB → ${formatBytes(result.compressedSize)} KB | ${savingsDisplay}`);
    });

    console.log('\n✅ SVG compression completed successfully!');

    return summary;
}

/**
 * Main compression function for changed SVG files (ImgBot-like behavior)
 */
async function compressChangedSvgs(): Promise<CompressionSummary> {
    console.log('🔍 Detecting changed SVG files...\n');

    const changedSvgFiles = getChangedSvgFiles();

    if (changedSvgFiles.length === 0) {
        console.log('❌ No changed SVG files found.');
        return {
            totalFiles: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalSavings: 0,
            totalSavingsPercent: 0,
            results: [],
        };
    }

    console.log(`📋 Found ${changedSvgFiles.length} changed SVG file(s):`);
    changedSvgFiles.forEach((file, index) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`   ${index + 1}. ${relativePath}`);
    });
    console.log('');

    return await processFiles(changedSvgFiles);
}

/**
 * Get changed SVG files from git diff
 */
function getChangedSvgFiles(): string[] {
    try {
        let gitCommand: string;
        let changedFiles: string[] = [];

        // Determine the appropriate git command based on the context using CONST values
        const eventName = process.env.GITHUB_EVENT_NAME;

        if (eventName === 'schedule') {
            // For scheduled runs, look for SVG files modified in the last week
            console.log('🕒 Scheduled run: checking SVG files modified in the last 7 days');
            gitCommand = 'git diff --name-only HEAD --since="7 days ago"';
        } else if (eventName === 'workflow_dispatch') {
            // For manual triggers, scan all SVGs in assets directory
            console.log('🔨 Manual trigger: scanning all SVG files in assets directory');
            return findSvgFiles('assets');
        } else if (eventName === CONST.RUN_EVENT.PUSH) {
            // For push events, compare with the previous commit
            gitCommand = 'git diff --name-only HEAD~1 HEAD';
        } else {
            // Fallback for unknown event types
            console.log(`⚠️ Unknown event type '${eventName}', defaulting to HEAD~1 comparison`);
            throw new Error(`Unknown event type: ${eventName}`);
        }

        const output = execSync(gitCommand, {encoding: 'utf-8', timeout: 30000});
        changedFiles = output.trim().split('\n').filter(Boolean);

        // If no changed files found in scheduled mode, fallback to scanning assets
        if (changedFiles.length === 0 && eventName === 'schedule') {
            console.log('⚠️ No recent changes found, scanning for unoptimized SVGs in assets directory');
            return findSvgFiles('assets');
        }

        // Filter only SVG files that exist (not deleted)
        const svgFiles = changedFiles
            .filter((file) => path.extname(file).toLowerCase() === '.svg')
            .filter((file) => fs.existsSync(file))
            .map((file) => path.resolve(file));

        return svgFiles;
    } catch (error) {
        console.error('❌ Error getting changed files:', error);
        return [];
    }
}

/**
 * Generate markdown summary for PR body
 */
function generateMarkdownSummary(summary: CompressionSummary): string {
    const markdown: string[] = [];

    markdown.push('## 🗜️ SVG Compression Results\n');

    if (summary.totalFiles === 0) {
        markdown.push('No SVG files were compressed.');
        return markdown.join('\n');
    }

    markdown.push(`**📊 Summary:**`);
    markdown.push(`- 📁 Files processed: ${summary.totalFiles}`);
    markdown.push(`- 📦 Original size: ${formatBytes(summary.totalOriginalSize)} KB`);
    markdown.push(`- 🗜️ Compressed size: ${formatBytes(summary.totalCompressedSize)} KB`);
    markdown.push(`- 💾 Total savings: ${formatBytes(summary.totalSavings)} KB (${summary.totalSavingsPercent.toFixed(2)}%)`);
    markdown.push('');

    if (summary.results.length > 0) {
        markdown.push('**📋 Individual Results:**');
        markdown.push('| File | Original | Compressed | Savings |');
        markdown.push('|------|----------|------------|---------|');

        summary.results.forEach((result) => {
            const relativePath = path.relative(process.cwd(), result.filePath);
            const savingsText = result.savings > 0 ? `${formatBytes(result.savings)} KB (${result.savingsPercent.toFixed(1)}%)` : 'No savings';

            markdown.push(`| \`${relativePath}\` | ${formatBytes(result.originalSize)} KB | ${formatBytes(result.compressedSize)} KB | ${savingsText} |`);
        });
    }

    markdown.push('');
    markdown.push('*This compression was performed automatically to optimize SVG file sizes.*');

    return markdown.join('\n');
}

/**
 * Display help information
 */
function displayHelp() {
    console.log('🎯 SVG Compression Tool');
    console.log('');
    console.log('Usage:');
    console.log('  Mode 1 - ImgBot-like behavior (default):');
    console.log('    npm run compress-svg');
    console.log('    npm run compress-svg --changed');
    console.log('    Detects changed SVG files based on context (push/schedule/manual)');
    console.log('');
    console.log('  Mode 2 - Specific files:');
    console.log('    npm run compress-svg -- --files file1.svg file2.svg ...');
    console.log('    Example: npm run compress-svg -- --files assets/icon.svg src/logo.svg');
    console.log('');
    console.log('  Mode 3 - Directory scan:');
    console.log('    npm run compress-svg [directory]');
    console.log('    Example: npm run compress-svg assets');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('  --changed     Detect and compress changed SVG files (default)');
    console.log('  --files       Compress only the specified files');
    console.log('');
    console.log('Context-based behavior:');
    console.log('  - Push events: Compare with previous commit');
    console.log('  - Scheduled runs: Check files modified in last 7 days');
    console.log('  - Manual triggers: Scan all SVGs in assets directory');
}

// Main execution
async function main() {
    try {
        const args = process.argv.slice(2);

        // Show help
        if (args.includes('--help') || args.includes('-h')) {
            displayHelp();
            return;
        }

        console.log('🎯 SVG Compression Tool (ImgBot-like)');
        console.log('');

        // Mode 1: ImgBot-like behavior - process changed SVG files
        if (args.length === 0 || args[0] === '--changed') {
            console.log('📁 Mode: Changed files detection');
            console.log('');

            const summary = await compressChangedSvgs();

            // Output summary for GitHub Actions to use
            if (summary.totalSavings > 0) {
                const markdown = generateMarkdownSummary(summary);
                console.log('\n📋 Markdown summary for PR:');
                console.log('---');
                console.log(markdown);
                console.log('---');

                // Set GitHub Actions outputs using proper core methods
                core.setOutput('markdown', markdown);
                core.setOutput('has_changes', 'true');
                core.setOutput('files_changed', summary.totalFiles.toString());
                core.setOutput('savings_kb', formatBytes(summary.totalSavings));

                console.log('\n📤 GitHub Actions outputs set successfully');
            } else {
                // Set GitHub Actions output for no changes
                core.setOutput('markdown', 'No SVG files were compressed.');
                core.setOutput('has_changes', 'false');
                core.setOutput('files_changed', '0');
                core.setOutput('savings_kb', '0');

                console.log('\n📤 No changes - GitHub Actions outputs set');
            }
            return;
        }

        // Mode 2: Specific files (--files flag)
        if (args[0] === '--files') {
            if (args.length < 2) {
                console.error('❌ No files specified after --files flag');
                console.log('');
                displayHelp();
                process.exit(1);
            }

            const filePaths = args.slice(1);
            console.log(`📁 Mode: Specific files (${filePaths.length} files provided)`);
            console.log('');

            await compressSvgsFromList(filePaths);
            return;
        }

        // Mode 3: Directory scan
        const targetDir = args[0];

        if (!fs.existsSync(targetDir)) {
            console.error(`❌ Directory '${targetDir}' does not exist.`);
            process.exit(1);
        }

        const stat = fs.statSync(targetDir);
        if (!stat.isDirectory()) {
            console.error(`❌ '${targetDir}' is not a directory.`);
            console.log('💡 Use --files flag to compress specific files');
            process.exit(1);
        }

        console.log(`📂 Mode: Directory scan`);
        console.log(`📂 Target directory: ${path.resolve(targetDir)}`);
        console.log('');

        await compressSvgsFromDirectory(targetDir);
    } catch (error) {
        const errorMessage = `Fatal error during SVG compression: ${error instanceof Error ? error.message : String(error)}`;
        console.error('❌', errorMessage);

        // Use proper GitHub Actions error handling
        core.setFailed(errorMessage);
        process.exit(1);
    }
}

main();
