#!/usr/bin/env bun

/**
 * CLI entry point for scripts/fixLottieAssets.ts. This file is never imported by anything (the tests import the
 * library directly), so it can unconditionally parse argv and run.
 */
import * as path from 'path';

import fixLottieAssets from './fixLottieAssets';

const ANIMATIONS_DIRECTORY = path.resolve(import.meta.dirname, '../assets/animations');

function logHelp() {
    console.log('');
    console.log('Usage:');
    console.log('  npm run fix-lottie-assets              Rewrite the Lottie files of assets/animations that need a fix');
    console.log('  npm run fix-lottie-assets -- --check   Only list the files that need a fix, and fail if there are any');
    console.log('');
    console.log('Run it after Design re-exports one of the files the script knows about. Files that are already fixed are left untouched.');
    console.log('');
}

const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
    logHelp();
    process.exit(0);
}

const isCheckOnly = args.has('--check');
const assets = fixLottieAssets(ANIMATIONS_DIRECTORY, !isCheckOnly);
const changedAssets = assets.filter((asset) => asset.appliedFixes.length > 0);

for (const asset of assets) {
    if (asset.appliedFixes.length === 0) {
        console.log(`✅ ${asset.fileName} is already fixed`);
    } else {
        console.log(`${isCheckOnly ? '❌' : '🔧'} ${asset.fileName}: ${isCheckOnly ? 'needs a fix' : asset.appliedFixes.join(', ')}`);
    }
}

if (isCheckOnly && changedAssets.length > 0) {
    console.error('');
    console.error(`${changedAssets.length} Lottie file(s) need a fix. Run 'npm run fix-lottie-assets' and commit the result.`);
    process.exit(1);
}
