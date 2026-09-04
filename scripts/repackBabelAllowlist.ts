import {isRecord} from '@libs/ObjectUtils';

import fs from 'node:fs';
import path from 'node:path';

/** Why a package needs the babel path. */
type BabelNeed = 'flow' | 'codegen';

type ScanFinding = {
    packageName: string;
    need: BabelNeed;
    /** node_modules-relative path of the file that triggered the finding. */
    file: string;
};

/** Only the top of a file is searched for the Flow pragma, matching how Flow itself reads it. */
const FLOW_PRAGMA_WINDOW_BYTES = 1024;

const FLOW_PRAGMA_REGEX = /(?:\/\*[\s*]*@flow(?:\s|\*)|\/\/\s*@flow(?:\s|$))/m;

/** Fabric codegen markers whose transform only the RN babel preset provides. */
const CODEGEN_MARKERS = ['codegenNativeComponent', 'codegenNativeCommands'];

const SCANNED_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.jsx']);

/**
 * Build-time tooling that ships to node_modules as a prod dependency but is never resolved into
 * the native app bundle. These mention the codegen markers because they themselves implement
 * codegen detection (regexes/strings), not because they need the babel path.
 */
const TOOLING_PACKAGE_PREFIXES = ['@expo/cli', '@react-native-community/cli', 'expo-modules-autolinking', '@react-native/codegen'];

function isToolingPackage(packageName: string): boolean {
    return TOOLING_PACKAGE_PREFIXES.some((prefix) => packageName === prefix || packageName.startsWith(`${prefix}-`) || packageName.startsWith(`${prefix}/`));
}

/**
 * True when `packageName` is covered by the allowlist. A scope entry (e.g. '@react-native')
 * covers every package in the scope, mirroring how the rspack rule's regex matches paths.
 */
function isAllowlisted(packageName: string, allowlist: string[]): boolean {
    return allowlist.some((entry) => packageName === entry || (entry.startsWith('@') && !entry.includes('/') && packageName.startsWith(`${entry}/`)));
}

/** Recursively collect relative JS entry paths from a package.json `exports` value. */
function collectExportPaths(exportsValue: unknown, accumulator: string[]): void {
    if (typeof exportsValue === 'string') {
        accumulator.push(exportsValue);
        return;
    }
    if (Array.isArray(exportsValue)) {
        for (const entry of exportsValue) {
            collectExportPaths(entry, accumulator);
        }
        return;
    }
    if (typeof exportsValue === 'object' && exportsValue !== null) {
        for (const entry of Object.values(exportsValue)) {
            collectExportPaths(entry, accumulator);
        }
    }
}

/**
 * Directories of a package that ship runtime JS, derived from its package.json entry fields.
 * Scanning only these avoids false positives from Flow-typed `src/` trees that are published
 * alongside compiled output but never resolved by the bundler. Returns package-relative
 * directories; ['.'] means the whole package must be scanned (entry at the root or no entry data).
 */
function getShippedDirectories(packageJson: Record<string, unknown>): string[] {
    const entryPaths: string[] = [];
    for (const field of ['main', 'module', 'react-native', 'browser']) {
        const value = packageJson[field];
        if (typeof value === 'string') {
            entryPaths.push(value);
        }
    }
    collectExportPaths(packageJson.exports, entryPaths);

    const directories = new Set<string>();
    for (const entryPath of entryPaths) {
        if (!/\.[cm]?jsx?$/.test(entryPath) && !/\/[^.]+$/.test(entryPath)) {
            continue;
        }
        const normalized = path.normalize(entryPath).replace(/^\.\//, '');
        const [topLevelDirectory] = normalized.split(path.sep);
        if (!topLevelDirectory || topLevelDirectory.includes('.') || topLevelDirectory === '*') {
            // Entry file sits at the package root — we can't narrow the scan.
            return ['.'];
        }
        directories.add(topLevelDirectory);
    }
    return directories.size > 0 ? [...directories] : ['.'];
}

function needsBabelReason(filePath: string): BabelNeed | null {
    let content: string;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
    if (FLOW_PRAGMA_REGEX.test(content.slice(0, FLOW_PRAGMA_WINDOW_BYTES))) {
        return 'flow';
    }
    if (CODEGEN_MARKERS.some((marker) => content.includes(marker))) {
        return 'codegen';
    }
    return null;
}

/** First babel-requiring file under `directory`, searched depth-first. */
function scanDirectory(directory: string, packageRoot: string): {need: BabelNeed; file: string} | null {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(directory, {withFileTypes: true});
    } catch {
        return null;
    }
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name === '__mocks__') {
                continue;
            }
            const found = scanDirectory(entryPath, packageRoot);
            if (found) {
                return found;
            }
        } else if (entry.isFile() && SCANNED_EXTENSIONS.has(path.extname(entry.name)) && !entry.name.endsWith('.js.flow') && !entry.name.endsWith('.flow.js')) {
            const need = needsBabelReason(entryPath);
            if (need) {
                return {need, file: path.relative(packageRoot, entryPath)};
            }
        }
    }
    return null;
}

/** Scan one installed package; null when it doesn't need the babel path. */
function scanPackage(packageDirectory: string, packageName: string): ScanFinding | null {
    let packageJson: Record<string, unknown>;
    try {
        const parsed: unknown = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'));
        if (!isRecord(parsed)) {
            return null;
        }
        packageJson = parsed;
    } catch {
        return null;
    }
    for (const shippedDirectory of getShippedDirectories(packageJson)) {
        const found = scanDirectory(path.resolve(packageDirectory, shippedDirectory), packageDirectory);
        if (found) {
            return {packageName, need: found.need, file: path.join(shippedDirectory === '.' ? '' : '', found.file)};
        }
    }
    return null;
}

/** Names of all installed packages (scoped included), sorted. */
function listInstalledPackages(nodeModulesPath: string): string[] {
    const names: string[] = [];
    for (const entry of fs.readdirSync(nodeModulesPath, {withFileTypes: true})) {
        if (!entry.isDirectory() && !entry.isSymbolicLink()) {
            continue;
        }
        if (entry.name.startsWith('.')) {
            continue;
        }
        if (entry.name.startsWith('@')) {
            const scopePath = path.join(nodeModulesPath, entry.name);
            for (const scopedEntry of fs.readdirSync(scopePath, {withFileTypes: true})) {
                if (scopedEntry.isDirectory() || scopedEntry.isSymbolicLink()) {
                    names.push(`${entry.name}/${scopedEntry.name}`);
                }
            }
        } else {
            names.push(entry.name);
        }
    }
    return names.sort();
}

/**
 * Names of packages that some prod (non-dev) install instance in the lockfile resolves to.
 * Dev-only packages can't end up in the native bundle, so the scan skips them. Nested installs
 * (node_modules/a/node_modules/b) count under their bare name. Returns null when the lockfile
 * can't be read — callers then scan everything rather than silently skipping packages.
 */
function loadProdPackageNames(lockfilePath: string): Set<string> | null {
    let packages: Record<string, unknown>;
    try {
        const parsed: unknown = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
        if (!isRecord(parsed) || !isRecord(parsed.packages)) {
            return null;
        }
        packages = parsed.packages;
    } catch {
        return null;
    }
    const prodNames = new Set<string>();
    for (const [installPath, entry] of Object.entries(packages)) {
        if (!installPath || (isRecord(entry) && entry.dev === true)) {
            continue;
        }
        const marker = installPath.lastIndexOf('node_modules/');
        if (marker === -1) {
            continue;
        }
        prodNames.add(installPath.slice(marker + 'node_modules/'.length));
    }
    return prodNames;
}

/**
 * Packages under `nodeModulesPath` that need the babel path but are missing from `allowlist`.
 * This is the CI guard's core: a non-empty result means a dependency change would break the
 * native build or crash the app at launch (see config/repack/babelPackages.mjs).
 */
function findMissingAllowlistEntries(nodeModulesPath: string, allowlist: string[], prodPackageNames: Set<string> | null = null): ScanFinding[] {
    const findings: ScanFinding[] = [];
    for (const packageName of listInstalledPackages(nodeModulesPath)) {
        if (isAllowlisted(packageName, allowlist) || isToolingPackage(packageName)) {
            continue;
        }
        if (prodPackageNames && !prodPackageNames.has(packageName)) {
            continue;
        }
        const finding = scanPackage(path.join(nodeModulesPath, packageName), packageName);
        if (finding) {
            findings.push(finding);
        }
    }
    return findings;
}

export type {ScanFinding, BabelNeed};
export {findMissingAllowlistEntries, isAllowlisted, getShippedDirectories, scanPackage, listInstalledPackages, loadProdPackageNames, isToolingPackage};
