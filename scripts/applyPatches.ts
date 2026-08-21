#!/usr/bin/env bun

/**
 * Applies App and Mobile-Expensify patches, failing on patch-package errors or warnings.
 */
import {$, Glob, stripANSI} from 'bun';
import {existsSync} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {basename, join, relative} from 'node:path';

import {error, info, success} from './utils/Logger';

const projectRoot = join(import.meta.dir, '..');
const mobileExpensifyRoot = join(projectRoot, 'Mobile-Expensify');
const patchGlob = new Glob('**/*.patch');
const patchWarningMessage =
    'It looks like you upgraded a dependency without upgrading the patch. Please review the patch, determine if it is still needed, and port it to the new version of the dependency.';

type PatchResult = {
    exitCode: number;
    output: string;
};

async function isHybridAppRepo(): Promise<boolean> {
    const packageJson = Bun.file(join(mobileExpensifyRoot, 'package.json'));
    if (!(await packageJson.exists())) {
        if (existsSync(mobileExpensifyRoot)) {
            console.log('package.json not found in Mobile-Expensify');
        }
        return false;
    }

    const packageMetadata: unknown = await packageJson.json();
    if (typeof packageMetadata === 'object' && packageMetadata !== null && 'name' in packageMetadata && packageMetadata.name === 'mobile-expensify') {
        return true;
    }

    console.log("The package name is incorrect. It should be 'mobile-expensify'. Script will assume the standalone NewDot app.");
    return false;
}

async function stagePatchFiles(destination: string, patchDirectories: string[]): Promise<void> {
    for (const patchDirectory of patchDirectories) {
        const writes: Array<Promise<number>> = [];
        for await (const source of patchGlob.scan({cwd: patchDirectory, absolute: true})) {
            writes.push(Bun.write(join(destination, basename(source)), Bun.file(source)));
        }
        await Promise.all(writes);
    }
}

async function runPatchPackage(patchDirectory: string): Promise<PatchResult> {
    const patchPackage = join(projectRoot, 'node_modules', '.bin', 'patch-package');
    const result = await $`${patchPackage} --patch-dir ${relative(projectRoot, patchDirectory)} --error-on-fail --color=always 2>&1`.cwd(projectRoot).nothrow();
    return {exitCode: result.exitCode, output: result.stdout.toString()};
}

function getFailedPackages(output: string): string[] {
    const packages = new Set<string>();
    for (const match of stripANSI(output).matchAll(/The patches for (\S+)/g)) {
        packages.add(match[1]);
    }
    return [...packages];
}

function hasWarnings(output: string): boolean {
    return output.includes('Warning:');
}

async function main(): Promise<number> {
    if (process.platform !== 'darwin' && process.platform !== 'linux') {
        error(`Unsupported OS: ${process.platform}`);
        return 1;
    }

    const patchDirectories = [join(projectRoot, 'patches')];
    const standaloneNewDot = process.env.STANDALONE_NEW_DOT;
    const isStandaloneNewDot = standaloneNewDot !== undefined && standaloneNewDot !== '' && standaloneNewDot !== 'false';
    if (!isStandaloneNewDot && (await isHybridAppRepo())) {
        patchDirectories.push(join(mobileExpensifyRoot, 'patches'));
    }

    const temporaryPatchDirectory = await mkdtemp(join(projectRoot, 'tmp-patches-'));
    try {
        await stagePatchFiles(temporaryPatchDirectory, patchDirectories);

        const result = await runPatchPackage(temporaryPatchDirectory);
        console.log();
        if (result.exitCode === 0) {
            if (hasWarnings(result.output)) {
                error(patchWarningMessage);
                return 1;
            }

            success('patch-package succeeded without errors or warnings');
            return 0;
        }

        const failedPackages = getFailedPackages(result.output);
        if (failedPackages.length === 0) {
            error('patch-package failed');
            return 1;
        }

        error('patch-package failed to apply one or more patches, cleaning failed packages and trying once again.');
        for (const packageName of failedPackages) {
            info(`patch failed to apply for ${packageName}. Removing it before reinstall...`);
            await rm(join(projectRoot, 'node_modules', packageName), {recursive: true, force: true});
        }

        const installResult = await $`npm install --ignore-scripts`.cwd(projectRoot).nothrow();
        if (installResult.exitCode !== 0) {
            error('npm install failed while restoring packages');
            return 1;
        }

        const retryResult = await runPatchPackage(temporaryPatchDirectory);
        if (retryResult.exitCode !== 0) {
            error('patch-package failed after retry, giving up');
            return 1;
        }
        if (hasWarnings(retryResult.output)) {
            error(patchWarningMessage);
            return 1;
        }

        success('patch-package succeeded after retry');
        return 0;
    } finally {
        await rm(temporaryPatchDirectory, {recursive: true, force: true});
    }
}

try {
    process.exitCode = await main();
} catch (caughtError) {
    error(caughtError);
    process.exitCode = 1;
}
