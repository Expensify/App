#!/usr/bin/env bun

/**
 * CLI entry point for scripts/compressSvg.mts. This file is never imported by anything (the action and tests import
 * the library directly), so it can unconditionally parse argv and run — no entry guard needed.
 */
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line import/extensions -- relative imports require an explicit extension under Node's ESM resolution (this file is real ESM, see the .mts extension)
import compressSvg from './compressSvg.mjs';

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
    console.log('To ignore compression for a file, add "-ignore-compression" to the file name: file-ignore-compression.svg');
    console.log('');
}

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

    compressSvg('directory', {targetDir})
        .then(() => {
            console.log('\n✅ SVG compression completed successfully');
            process.exit(0);
        })
        .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Fatal error: ${errorMessage}`);
            process.exit(1);
        });
} else if (firstArg === '--files' || firstArg === '-f') {
    if (args.length < 2) {
        console.error('❌ No files specified after --files flag');
        console.log('');
        logHelp();
        process.exit(1);
    }

    const filePaths = args.slice(1);
    console.log(`Specific files (${filePaths.length} files provided)`);

    compressSvg('files', {filePaths})
        .then(() => {
            console.log('\n✅ SVG compression completed successfully');
            process.exit(0);
        })
        .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Fatal error: ${errorMessage}`);
            process.exit(1);
        });
}
// No arguments provided - show help
else {
    logHelp();
    process.exit(0);
}
