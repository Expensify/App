/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention -- fixture keys are file and directory paths */
import {afterAll, beforeAll, describe, expect, it} from 'bun:test';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {findMissingAllowlistEntries, getShippedDirectories, isAllowlisted, isToolingPackage, loadProdPackageNames} from '../../scripts/repackBabelAllowlist';

let fixtureRoot: string;
let nodeModulesPath: string;

function writePackage(name: string, packageJson: Record<string, unknown>, files: Record<string, string>) {
    const packageRoot = path.join(nodeModulesPath, name);
    fs.mkdirSync(packageRoot, {recursive: true});
    fs.writeFileSync(path.join(packageRoot, 'package.json'), JSON.stringify({name, version: '1.0.0', ...packageJson}));
    for (const [relativePath, content] of Object.entries(files)) {
        const filePath = path.join(packageRoot, relativePath);
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        fs.writeFileSync(filePath, content);
    }
}

beforeAll(() => {
    // Given a synthetic node_modules with one package per detection scenario
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'repack-allowlist-'));
    nodeModulesPath = path.join(fixtureRoot, 'node_modules');

    writePackage('plain-pkg', {main: 'lib/index.js'}, {'lib/index.js': 'module.exports = 1;'});
    writePackage('flow-pkg', {main: 'lib/index.js'}, {'lib/index.js': '/* @flow */\nmodule.exports = 1;'});
    writePackage('codegen-pkg', {main: 'lib/index.js'}, {'lib/index.js': "const c = require('rn/codegenNativeComponent'); codegenNativeComponent('X');"});
    writePackage('codegen-commands-pkg', {main: 'lib/index.js'}, {'lib/index.js': 'codegenNativeCommands({supportedCommands: []});'});
    // Flow only in an unshipped src/ tree next to compiled output — must NOT be flagged
    writePackage('src-flow-pkg', {main: 'lib/index.js'}, {'lib/index.js': 'module.exports = 1;', 'src/index.js': '// @flow\nexport default 1;'});
    // Flow type snapshot files that are never bundled — must NOT be flagged
    writePackage('flow-typedef-pkg', {main: 'index.js'}, {'index.js': 'module.exports = 1;', 'index.js.flow': '// @flow', 'index.flow.js': '// @flow'});
    writePackage('allowlisted-pkg', {main: 'index.js'}, {'index.js': '// @flow\nmodule.exports = 1;'});
    writePackage('@scope/scoped-flow-pkg', {main: 'index.js'}, {'index.js': '// @flow\nmodule.exports = 1;'});
    // Tooling package mentioning the marker inside a detection regex — must NOT be flagged
    writePackage('@react-native-community/cli-config-android', {main: 'build/index.js'}, {'build/index.js': 'const r = /codegenNativeComponent(<.*>)?/;'});
});

afterAll(() => {
    fs.rmSync(fixtureRoot, {recursive: true, force: true});
});

describe('isAllowlisted', () => {
    it('matches exact names and scope prefixes', () => {
        // Given an allowlist with a plain name and a bare scope
        const allowlist = ['react-native', '@react-native'];
        // Then exact names, scope members match; lookalike prefixes do not
        expect(isAllowlisted('react-native', allowlist)).toBe(true);
        expect(isAllowlisted('@react-native/babel-preset', allowlist)).toBe(true);
        expect(isAllowlisted('react-native-svg', allowlist)).toBe(false);
        expect(isAllowlisted('@react-native-community/netinfo', allowlist)).toBe(false);
    });
});

describe('getShippedDirectories', () => {
    it('narrows the scan to entry-point directories', () => {
        // Given a package.json whose entries live under lib/ and dist/
        const shipped = getShippedDirectories({main: 'lib/commonjs/index.js', module: './dist/index.mjs'});
        // Then only those top-level directories are scanned
        expect(shipped.sort()).toEqual(['dist', 'lib']);
    });

    it('falls back to the whole package for root entries or missing fields', () => {
        // Given an entry at the package root / no entry data at all
        expect(getShippedDirectories({main: 'index.js'})).toEqual(['.']);
        expect(getShippedDirectories({})).toEqual(['.']);
    });
});

describe('isToolingPackage', () => {
    it('recognizes build tooling and leaves runtime scope-mates alone', () => {
        expect(isToolingPackage('@react-native-community/cli-config-android')).toBe(true);
        expect(isToolingPackage('@react-native-community/netinfo')).toBe(false);
        expect(isToolingPackage('expo-modules-autolinking')).toBe(true);
    });
});

describe('findMissingAllowlistEntries', () => {
    it('flags Flow and codegen packages that are missing from the allowlist', () => {
        // When scanning the fixture tree with only allowlisted-pkg and the scope allowlisted
        const missing = findMissingAllowlistEntries(nodeModulesPath, ['allowlisted-pkg', '@scope']);
        const names = missing.map((finding) => finding.packageName).sort();
        // Then the Flow package and both codegen packages are reported, nothing else
        expect(names).toEqual(['codegen-commands-pkg', 'codegen-pkg', 'flow-pkg']);
        expect(missing.find((finding) => finding.packageName === 'flow-pkg')?.need).toBe('flow');
        expect(missing.find((finding) => finding.packageName === 'codegen-pkg')?.need).toBe('codegen');
    });

    it('skips packages that are not in the prod dependency set', () => {
        // Given a prod set that omits flow-pkg (i.e. flow-pkg is dev-only)
        const prodNames = new Set(['plain-pkg', 'codegen-pkg', 'codegen-commands-pkg']);
        // When scanning with the prod filter
        const missing = findMissingAllowlistEntries(nodeModulesPath, ['allowlisted-pkg', '@scope'], prodNames);
        // Then dev-only flow-pkg is not reported
        expect(missing.map((finding) => finding.packageName).sort()).toEqual(['codegen-commands-pkg', 'codegen-pkg']);
    });
});

describe('loadProdPackageNames', () => {
    it('collects non-dev packages from a v3 lockfile, including nested installs', () => {
        // Given a lockfile with prod, dev, and nested entries
        const lockfilePath = path.join(fixtureRoot, 'package-lock.json');
        fs.writeFileSync(
            lockfilePath,
            JSON.stringify({
                packages: {
                    '': {},
                    'node_modules/prod-pkg': {},
                    'node_modules/dev-pkg': {dev: true},
                    'node_modules/prod-pkg/node_modules/nested-pkg': {},
                },
            }),
        );
        // When loading the prod set
        const prodNames = loadProdPackageNames(lockfilePath);
        // Then prod and nested names are present, dev ones are not
        expect(prodNames?.has('prod-pkg')).toBe(true);
        expect(prodNames?.has('nested-pkg')).toBe(true);
        expect(prodNames?.has('dev-pkg')).toBe(false);
    });

    it('returns null when the lockfile is unreadable', () => {
        expect(loadProdPackageNames(path.join(fixtureRoot, 'missing.json'))).toBeNull();
    });
});
