#!/usr/bin/env bun

/**
 * CI guard for the Re.Pack babel allowlist (config/repack/babelPackages.mjs).
 *
 * The native build routes only allowlisted packages through babel + hermes-parser; everything else
 * takes the fast OXC/SWC path, which can't handle Flow syntax or the RN codegen markers. A
 * dependency change that introduces such a package otherwise surfaces as a native build failure or
 * an app-launch crash — this script fails the PR instead, naming the package and the evidence file.
 *
 * Run from the repo root: bun ./scripts/checkRepackBabelAllowlist.ts
 */
import path from 'node:path';

// The explicit .mjs extension is required for Node/bun ESM resolution of this JS module.
// eslint-disable-next-line import/extensions
import BABEL_PACKAGES from '../config/repack/babelPackages.mjs';
import {findMissingAllowlistEntries, loadProdPackageNames} from './repackBabelAllowlist';

const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');

const prodPackageNames = loadProdPackageNames(path.join(projectRoot, 'package-lock.json'));
if (!prodPackageNames) {
    console.warn('⚠️ Could not read package-lock.json — scanning all installed packages, dev dependencies included.');
}
const missing = findMissingAllowlistEntries(nodeModulesPath, BABEL_PACKAGES, prodPackageNames);

if (missing.length === 0) {
    console.log(`✅ All packages needing the babel path are allowlisted (${BABEL_PACKAGES.length} entries).`);
    process.exit(0);
}

console.error('❌ Packages that need the Re.Pack babel path but are missing from config/repack/babelPackages.mjs:\n');
for (const finding of missing) {
    const reason = finding.need === 'flow' ? 'ships Flow-typed runtime JS' : 'uses RN codegen markers (codegenNativeComponent/Commands)';
    console.error(`  - ${finding.packageName}: ${reason}\n    evidence: node_modules/${finding.packageName}/${finding.file}`);
}
console.error('\nAdd each package to BABEL_PACKAGES in config/repack/babelPackages.mjs (with a comment on why), or exclude the offending file from the native bundle.');
process.exit(1);
