#!/usr/bin/env bun

/**
 * Defines the CLI that prepares the legacy native projects for a uniquely identified local device build.
 * If run directly, it will run the CLI and report uncaught failures as command-line errors.
 */

import type {TupleToUnion} from 'type-fest';

import {$} from 'bun';
import CLI from 'expensify-common/CLI';

import type {AndroidApplicationIDs} from './lib/bootstrapForDevice/android';
import type {DevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import type {Configuration, Target} from './lib/bootstrapForDevice/ios';
import type {AndroidBootstrapOptions, BootstrapOptions} from './lib/bootstrapForDevice/shared';

import {bootstrapAndroidForDevice, normalizeAndroidIdentifierSegment} from './lib/bootstrapForDevice/android';
import {resolveDevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import {bootstrapIOSForDevice} from './lib/bootstrapForDevice/ios';
import {PLATFORMS} from './lib/bootstrapForDevice/shared';

type Platform = TupleToUnion<typeof PLATFORMS>;

if (import.meta.main) {
    main(`${import.meta.dirname}/..`).catch((error: Error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

async function main(rootDirectory: string): Promise<void> {
    // The CLI framework requires kebab-case named argument keys, which the naming-convention rule cannot express.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to bootstrap (${PLATFORMS.join(', ')})`,
                default: 'ios' as Platform,
                parse: parsePlatform,
            },
        ],
        namedArgs: {
            'development-team': {
                description: 'Apple Developer team ID used for automatic signing',
                required: false,
            },
            'bundle-identifier': {
                description: 'Base bundle identifier or Android application ID for the Expensify app',
                required: false,
            },
            suffix: {
                description: 'Optional segment appended to the base bundle identifier',
                required: false,
            },
            'github-username': {
                description: 'GitHub username used to create the default bundle identifier (defaults to the active gh CLI user)',
                required: false,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platform = parsePlatform(String(cli.positionalArgs.platform));
    const username = cli.namedArgs['github-username'] ?? (cli.namedArgs['bundle-identifier'] ? undefined : await githubUsername());
    const bundleIdentifier = cli.namedArgs['bundle-identifier'] ?? defaultBundleIdentifier(username ?? '', platform);
    if (platform === 'android') {
        await bootstrapAndroidForDevice({rootDirectory, bundleIdentifier, suffix: cli.namedArgs.suffix});
        return;
    }
    const developmentTeam = await resolveDevelopmentTeam(cli.namedArgs['development-team']);
    await bootstrapIOSForDevice({
        rootDirectory,
        developmentTeam,
        bundleIdentifier,
        suffix: cli.namedArgs.suffix,
    });
}

/**
 * Resolves the lowercase login for the active gh CLI account for use in a unique application identifier.
 * The CLI prefers GH_TOKEN, then GITHUB_TOKEN, before its stored active account.
 */
async function githubUsername(): Promise<string> {
    const result = await $`gh api user --jq .login`.quiet().nothrow();
    const username = result.stdout.toString().trim().toLowerCase();
    if (result.exitCode !== 0 || !username) {
        throw new Error('Could not determine your GitHub username. Run gh auth login, or pass --github-username/--bundle-identifier.');
    }
    return username;
}

/** Builds the platform-specific application identifier used when no identifier is supplied explicitly. */
function defaultBundleIdentifier(username: string, platform: Platform = 'ios'): string {
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedUsername)) {
        throw new Error(`GitHub username cannot be used in a bundle identifier: ${username}`);
    }
    return platform === 'ios' ? `com.${normalizedUsername}.expensify.expensifylite` : `com.${normalizeAndroidIdentifierSegment(normalizedUsername)}.expensify`;
}

function parsePlatform(value: string): Platform {
    const platform = PLATFORMS.find((candidate) => candidate === value);
    if (!platform) {
        throw new Error(`Platform must be one of: ${PLATFORMS.join(', ')}. Received: ${value}`);
    }
    return platform;
}

export {bootstrapAndroidForDevice, bootstrapIOSForDevice, defaultBundleIdentifier, main, resolveDevelopmentTeam};
export {
    androidApplicationIDs,
    patchAndroidAppName,
    patchAndroidBuildGradle,
    patchAndroidManifest,
    patchAndroidShortcutPackage,
    patchGoogleServicesConfig,
    validateAndroidApplicationID,
} from './lib/bootstrapForDevice/android';
export {entitlementContents, patchIOSAppDisplayName, patchProject, targetBundleIdentifier} from './lib/bootstrapForDevice/ios';
export {validateSuffix} from './lib/bootstrapForDevice/shared';
export {installedDevelopmentTeams, parseDevelopmentTeamFromProvisioningProfile} from './lib/bootstrapForDevice/developmentTeams';
export type {AndroidApplicationIDs, AndroidBootstrapOptions, BootstrapOptions, Configuration, DevelopmentTeam, Platform, Target};
