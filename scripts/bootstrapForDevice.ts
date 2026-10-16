#!/usr/bin/env bun

/**
 * Defines the CLI that prepares the legacy native projects for a uniquely identified local device build.
 * If run directly, it will run the CLI and report uncaught failures as command-line errors.
 */

import type {TupleToUnion} from 'type-fest';

import {$, env} from 'bun';
import CLI from 'expensify-common/CLI';

import type {AndroidApplicationIDs} from './lib/bootstrapForDevice/android';
import type {DevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import type {Configuration, Target} from './lib/bootstrapForDevice/ios';
import type {AndroidBootstrapOptions, BootstrapOptions, BuildVariant, BuildVariants} from './lib/bootstrapForDevice/shared';

import {bootstrapAndroidForDevice, normalizeAndroidIdentifierSegment} from './lib/bootstrapForDevice/android';
import {resolveDevelopmentTeam} from './lib/bootstrapForDevice/developmentTeams';
import {bootstrapIOSForDevice} from './lib/bootstrapForDevice/ios';
import {BUILD_VARIANTS, DEFAULT_BUILD_VARIANTS, PLATFORMS, parseBuildVariants} from './lib/bootstrapForDevice/shared';

type Platform = TupleToUnion<typeof PLATFORMS>;
type Platforms = readonly [Platform, ...Platform[]];

const DEFAULT_PLATFORMS: Platforms = PLATFORMS;

async function main(rootDirectory: string): Promise<void> {
    // The CLI framework requires kebab-case named argument keys, which the naming-convention rule cannot express.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to bootstrap (${PLATFORMS.join(', ')}); omit to bootstrap both`,
                default: DEFAULT_PLATFORMS,
                parse: parsePlatforms,
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
            'identifier-suffix': {
                description: 'Suffix added to native app identifiers and launcher display names for side-by-side installations',
                required: false,
            },
            'github-username': {
                description: 'GitHub username used to create the default bundle identifier (defaults to the active gh CLI user or GH_TOKEN user)',
                required: false,
            },
            'build-variants': {
                description: `Comma-separated native build variants to patch (${BUILD_VARIANTS.join(', ')})`,
                default: DEFAULT_BUILD_VARIANTS,
                parse: parseBuildVariants,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platforms = cli.positionalArgs.platform;
    const username = cli.namedArgs['github-username'] ?? (cli.namedArgs['bundle-identifier'] ? undefined : await githubUsername());
    for (const platform of platforms) {
        const bundleIdentifier = cli.namedArgs['bundle-identifier'] ?? defaultBundleIdentifier(username ?? '', platform);
        if (platform === 'android') {
            await bootstrapAndroidForDevice({
                rootDirectory,
                bundleIdentifier,
                buildVariants: cli.namedArgs['build-variants'],
                identifierSuffix: cli.namedArgs['identifier-suffix'],
            });
            continue;
        }
        const developmentTeam = await resolveDevelopmentTeam(cli.namedArgs['development-team']);
        await bootstrapIOSForDevice({
            rootDirectory,
            developmentTeam,
            bundleIdentifier,
            buildVariants: cli.namedArgs['build-variants'],
            identifierSuffix: cli.namedArgs['identifier-suffix'],
        });
    }
}

/**
 * Resolves the lowercase login for use in a unique application identifier.
 * The gh CLI prefers GH_TOKEN, then GITHUB_TOKEN, before its stored active account; Octokit uses GH_TOKEN only when gh is unavailable.
 */
async function githubUsername(): Promise<string> {
    const ghExecutable = Bun.which('gh');
    if (!ghExecutable) {
        return githubUsernameFromToken();
    }

    const result = await $`${ghExecutable} api user --jq .login`.quiet().nothrow();
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

/** Selects one explicit platform while reserving the default non-empty tuple for both platforms. */
function parsePlatforms(value: string): Platforms {
    return [parsePlatform(value)];
}

function parsePlatform(value: string): Platform {
    const platform = PLATFORMS.find((candidate) => candidate === value);
    if (!platform) {
        throw new Error(`Platform must be one of: ${PLATFORMS.join(', ')}. Received: ${value}`);
    }
    return platform;
}

/** Resolves the lowercase login associated with GH_TOKEN when the gh CLI is unavailable. */
async function githubUsernameFromToken(): Promise<string> {
    const token = env.GH_TOKEN;
    if (!token) {
        throw new Error('Could not determine your GitHub username. Install and authenticate gh, set GH_TOKEN, or pass --github-username/--bundle-identifier.');
    }

    try {
        const {default: GithubUtils} = await import('@github/libs/GithubUtils');
        GithubUtils.initOctokitWithToken(token);
        const {data: user} = await GithubUtils.octokit.users.getAuthenticated();
        return user.login.toLowerCase();
    } catch {
        throw new Error('Could not determine your GitHub username. Check GH_TOKEN, or pass --github-username/--bundle-identifier.');
    }
}

if (import.meta.main) {
    main(`${import.meta.dirname}/..`).catch((error: Error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

export {DEFAULT_PLATFORMS, bootstrapAndroidForDevice, bootstrapIOSForDevice, defaultBundleIdentifier, main, parsePlatforms, resolveDevelopmentTeam};
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
export {BUILD_VARIANTS, DEFAULT_BUILD_VARIANTS, parseBuildVariants, validateIdentifierSuffix} from './lib/bootstrapForDevice/shared';
export {installedDevelopmentTeams, parseDevelopmentTeamFromProvisioningProfile} from './lib/bootstrapForDevice/developmentTeams';
export type {AndroidApplicationIDs, AndroidBootstrapOptions, BootstrapOptions, BuildVariant, BuildVariants, Configuration, DevelopmentTeam, Platform, Platforms, Target};
