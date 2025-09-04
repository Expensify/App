import * as fs from 'fs';
import * as path from 'path';
import {optimize} from 'svgo';

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
 * Main compression function for directory scanning
 */
async function compressSvgsFromDirectory(targetDir: string = 'assets'): Promise<void> {
    console.log('🔍 Searching for SVG files...\n');

    const svgFiles = findSvgFiles(targetDir);

    if (svgFiles.length === 0) {
        console.log('❌ No SVG files found in the specified directory.');
        return;
    }

    await processFiles(svgFiles);
}

/**
 * Main compression function for specific file list
 */
async function compressSvgsFromList(filePaths: string[]): Promise<void> {
    console.log('🔍 Validating provided SVG files...\n');

    const validatedFiles = validateSvgFiles(filePaths);

    if (validatedFiles.length === 0) {
        console.log('❌ No valid SVG files provided.');
        return;
    }

    await processFiles(validatedFiles);
}

/**
 * Process and compress a list of SVG files
 */
async function processFiles(svgFiles: string[]): Promise<void> {
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

    for (const [index, file] of svgFiles.entries()) {
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
    console.log(`🗜️  Compressed total size: ${formatBytes(summary.totalCompressedSize)} KB`);
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
}

/**
 * Display help information
 */
function displayHelp() {
    console.log('🎯 SVG Compression Tool');
    console.log('');
    console.log('Usage:');
    console.log('  Mode 1 - Directory scan:');
    console.log('    npm run compress-svg [directory]');
    console.log('    Example: npm run compress-svg assets');
    console.log('');
    console.log('  Mode 2 - Specific files:');
    console.log('    npm run compress-svg -- --files file1.svg file2.svg ...');
    console.log('    Example: npm run compress-svg -- --files assets/icon.svg src/logo.svg');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('  --files       Compress only the specified files');
    console.log('');
    console.log("Default: Scans 'assets' directory if no arguments provided");
}

// Main execution
async function main() {
    try {
        // const args = process.argv.slice(2);

        // TODO: Temporary hardcoded file for testing
        const args = ['--files', 'assets/images/apple.svg'];

        // // Show help
        // if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        //     if (args.length === 0) {
        //         // Default behavior: scan assets directory
        //         console.log('🎯 SVG Compression Tool');
        //         console.log(`📂 Target directory: ${path.resolve('assets')}`);
        //         console.log('');
        //         await compressSvgsFromDirectory('assets');
        //         return;
        //     }
        //     displayHelp();
        //     return;
        // }

        // console.log('TEST ', args);

        // Mode 2: Specific files (--files flag)
        if (args[0] === '--files') {
            if (args.length < 2) {
                console.error('❌ No files specified after --files flag');
                console.log('');
                displayHelp();
                process.exit(1);
            }

            const filePaths = args.slice(1);
            console.log('🎯 SVG Compression Tool');
            console.log(`📁 Mode: Specific files (${filePaths.length} files provided)`);
            console.log('');

            await compressSvgsFromList(filePaths);
            return;
        }

        // Mode 1: Directory scan
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

        console.log('🎯 SVG Compression Tool');
        console.log(`📂 Target directory: ${path.resolve(targetDir)}`);
        console.log('');

        await compressSvgsFromDirectory(targetDir);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

main();
