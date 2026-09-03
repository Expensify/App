#!/usr/bin/env bun

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import process from 'node:process';

import type {AndroidApplicationIDs} from './lib/bootstrapForDevice/android';
import type {DevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import type {Configuration, Target} from './lib/bootstrapForDevice/iOS';
import type {AndroidBootstrapOptions, BootstrapOptions} from './lib/bootstrapForDevice/shared';

import {bootstrapAndroidForDevice, normalizeAndroidIdentifierSegment} from './lib/bootstrapForDevice/android';
import {resolveDevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import {bootstrapIOSForDevice} from './lib/bootstrapForDevice/iOS';
import {PLATFORMS} from './lib/bootstrapForDevice/shared';

type Platform = TupleToUnion<typeof PLATFORMS>;

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
                description: 'GitHub username used to create the default bundle identifier (defaults to the GH_TOKEN or GITHUB_TOKEN user)',
                required: false,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platform = parsePlatform(String(cli.positionalArgs.platform));
    const username = cli.namedArgs['github-username'] ?? (cli.namedArgs['bundle-identifier'] ? undefined : await githubUsername());
    const bundleIdentifier = cli.namedArgs['bundle-identifier'] ?? defaultBundleIdentifier(username ?? '', platform);
    if (platform === 'android') {
        bootstrapAndroidForDevice({rootDirectory, bundleIdentifier, suffix: cli.namedArgs.suffix});
        return;
    }
    const developmentTeam = await resolveDevelopmentTeam(cli.namedArgs['development-team']);
    bootstrapIOSForDevice({
        rootDirectory,
        developmentTeam,
        bundleIdentifier,
        suffix: cli.namedArgs.suffix,
    });
}

/** Resolves the lowercase login associated with the configured GitHub token for use in a unique application identifier. */
async function githubUsername(): Promise<string> {
    const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('Could not determine your GitHub username. Set GH_TOKEN or GITHUB_TOKEN, or pass --github-username/--bundle-identifier.');
    }

    try {
        const {default: GithubUtils} = await import('@github/libs/GithubUtils');
        GithubUtils.initOctokitWithToken(token);
        const {data: user} = await GithubUtils.octokit.users.getAuthenticated();
        return user.login.toLowerCase();
    } catch {
        throw new Error('Could not determine your GitHub username. Check GH_TOKEN or GITHUB_TOKEN, or pass --github-username/--bundle-identifier.');
    }
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
export {entitlementContents, patchIOSAppDisplayName, patchProject, targetBundleIdentifier} from './lib/bootstrapForDevice/iOS';
export {validateSuffix} from './lib/bootstrapForDevice/shared';
export {installedDevelopmentTeams, parseDevelopmentTeamFromProvisioningProfile} from './lib/bootstrapForDevice/developmentTeams';
export type {AndroidApplicationIDs, AndroidBootstrapOptions, BootstrapOptions, Configuration, DevelopmentTeam, Platform, Target};
