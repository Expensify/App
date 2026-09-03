import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import {error as logError, info as logInfo, setOutputStream, warn as logWarn} from '@scripts/utils/Logger';

import {isRecord} from '@src/types/utils/ObjectUtils';

import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

import {getCredentials as getCredentialsFromCLI} from './githubCLI';

/**
 * Shared resolver for Expensify's patched React Native prebuilt artifacts.
 * Resolves which artifact version to use by matching the local patches hash
 * against the `patchesHash` recorded in each candidate's Maven POM. Consumed via
 * `resolve-artifacts.ts` by Gradle (Android) and `patched_ios_artifacts.rb` (iOS).
 */

type Platform = 'ios' | 'android';

/** A token authenticates every read; this is all iOS's curl Bearer download needs. */
type Credentials = {githubToken: string};
/** Android additionally needs the username, for Gradle's Maven `credentials {}` block. */
type CredentialsWithUsername = Credentials & {githubUsername: string};

type ResolveOptions = {
    platform: Platform;
    packageName: string;
    newDotRoot: string;
    isHybrid: boolean;
};

/** No prebuilt match (or no credentials): the caller builds react-native from source. Carries no secrets. */
type SourceBuild = {
    buildFromSource: true;
    version: null;
    packageName: string;
    artifactId: string;
};

/** A matching prebuilt artifact was found; carries the credentials the native download needs. */
type Prebuilt<Creds> = {
    buildFromSource: false;
    version: string;
    packageName: string;
    artifactId: string;
    artifactUrlPrefix: string;
} & Creds;

type IosResult = SourceBuild | Prebuilt<Credentials>;
type AndroidResult = SourceBuild | Prebuilt<CredentialsWithUsername>;
type ResolveResult = IosResult | AndroidResult;

const ARTIFACT_IDS = {
    android: 'react-android',
    ios: 'react-native-artifacts',
} satisfies Record<Platform, string>;

/** The Maven repository our artifacts are published to. */
const MAVEN_REPO_URL = `https://maven.pkg.github.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`;

const LOG_PREFIX = '[PatchedArtifacts]';

// stdout carries the JSON result that Gradle and CocoaPods parse, so every diagnostic goes to stderr
// (warnings and errors already do). Set here rather than in the CLI entry point, so the invariant
// holds for any consumer of this module.
setOutputStream({info: 'stderr'});

/** Reads a non-empty environment variable, or null. */
function getEnvVar(name: string): string | null {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Credentials come from the environment in CI and from the gh CLI on developer machines.
 * Reading from the CLI spawns processes, so each getter below reads exactly once.
 */
function readCredentials(): {githubToken: string | null; githubUsername: string | null} {
    if (process.env.CI != null) {
        return {githubToken: getEnvVar('GITHUB_TOKEN'), githubUsername: getEnvVar('GITHUB_ACTOR')};
    }
    return getCredentialsFromCLI();
}

/** Throws when no token is available. */
function getCredentials(): Credentials {
    const {githubToken} = readCredentials();
    if (githubToken == null) {
        throw new Error('Missing GitHub token (set GITHUB_TOKEN in CI, or run `gh auth login` locally).');
    }
    return {githubToken};
}

/** Throws when either the token or the username is unavailable. */
function getCredentialsWithUsername(): CredentialsWithUsername {
    const {githubToken, githubUsername} = readCredentials();
    if (githubToken == null || githubUsername == null) {
        throw new Error('Missing GitHub credentials (set GITHUB_TOKEN and GITHUB_ACTOR in CI, or run `gh auth login` locally).');
    }
    return {githubToken, githubUsername};
}

/**
 * Every file of an artifact version shares this prefix; a consumer only appends the extension or
 * classifier it wants (`.pom`, `-reactnative-core-release.tar.gz`, ...). Composed here so that the
 * native consumers never need to know our Maven coordinates.
 */
function getArtifactUrlPrefix(packageName: string, artifactId: string, version: string): string {
    return `${MAVEN_REPO_URL}/com/expensify/${packageName}/${artifactId}/${version}/${artifactId}-${version}`;
}

/**
 * GitHub Packages 302-redirects to a signed object-store URL on a different host.
 * `fetch` follows the redirect and drops the Authorization header on the
 * cross-origin hop, so the token reaches only the initial host, never the object store.
 */
async function fetchWithToken(url: string, githubToken: string): Promise<string> {
    const response = await fetch(url, {headers: {Authorization: `Bearer ${githubToken}`}});
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return response.text();
}

function getReactNativeVersion(newDotRoot: string): string {
    const parsed: unknown = JSON.parse(fs.readFileSync(path.join(newDotRoot, 'package.json'), 'utf8'));
    const dependencies = isRecord(parsed) ? parsed.dependencies : undefined;
    const version = isRecord(dependencies) ? dependencies['react-native'] : undefined;
    if (typeof version !== 'string') {
        throw new Error('Could not read react-native version from package.json');
    }
    return version;
}

function computePatchesHash(newDotRoot: string, isHybrid: boolean): string {
    const script = path.join(newDotRoot, 'scripts/artifacts-utils/compute-patches-hash.sh');
    const args = [script];
    if (isHybrid) {
        args.push(path.join(newDotRoot, 'patches'), path.join(newDotRoot, 'Mobile-Expensify/patches'));
    } else {
        args.push(path.join(newDotRoot, 'patches'));
    }
    return execFileSync('bash', args, {encoding: 'utf8'}).trim();
}

/** Published versions of the package that were built from the given react-native version. Requires `initGithubClient`. */
async function getArtifactsCandidates(packageName: string, artifactId: string, rnVersion: string): Promise<string[]> {
    /* eslint-disable @typescript-eslint/naming-convention -- GitHub REST API params are snake_case */
    const versions = await GithubUtils.paginate(GithubUtils.octokit.packages.getAllPackageVersionsForPackageOwnedByOrg, {
        package_type: 'maven',
        org: CONST.GITHUB_OWNER,
        package_name: `com.expensify.${packageName}.${artifactId}`,
        per_page: 100,
    }); /* eslint-enable @typescript-eslint/naming-convention */
    return versions.map((version) => version.name).filter((name) => name.startsWith(rnVersion));
}

async function getRemotePatchesHash(packageName: string, artifactId: string, version: string, githubToken: string): Promise<string | null> {
    const pom = await fetchWithToken(`${getArtifactUrlPrefix(packageName, artifactId, version)}.pom`, githubToken);
    return pom.match(/<patchesHash>([^<]+)<\/patchesHash>/)?.[1]?.trim() ?? null;
}

/** Returns null when no published artifact was built from the local patches — a legitimate result, not a failure. */
async function findMatchingArtifactsVersion(options: ResolveOptions, artifactId: string, githubToken: string): Promise<string | null> {
    const {packageName, newDotRoot, isHybrid} = options;
    const localPatchesHash = computePatchesHash(newDotRoot, isHybrid);
    const rnVersion = getReactNativeVersion(newDotRoot);
    const candidates = await getArtifactsCandidates(packageName, artifactId, rnVersion);
    for (const candidate of candidates) {
        const remoteHash = await getRemotePatchesHash(packageName, artifactId, candidate, githubToken);
        if (remoteHash === localPatchesHash) {
            return candidate;
        }
    }
    return null;
}

/**
 * Resolves whether a matching prebuilt artifact exists for the current patches.
 * Returns a `SourceBuild` (no secrets) when no match is found or credentials are
 * unavailable, otherwise a `Prebuilt` carrying the credentials the native
 * download needs — token only for iOS, username + token for Android.
 *
 * Anything unexpected (no credentials, an API or network failure) is logged and downgraded to a
 * source build here, so a build never dies on artifact resolution.
 */
function resolveArtifacts(options: ResolveOptions & {platform: 'ios'}): Promise<IosResult>;
function resolveArtifacts(options: ResolveOptions & {platform: 'android'}): Promise<AndroidResult>;
async function resolveArtifacts(options: ResolveOptions): Promise<ResolveResult> {
    const {platform, packageName} = options;
    const artifactId = ARTIFACT_IDS[platform];
    const sourceBuild: SourceBuild = {buildFromSource: true, version: null, packageName, artifactId};

    try {
        // Reading credentials validates them, so an incomplete setup fails before we spend time on API calls.
        const credentials = platform === 'android' ? getCredentialsWithUsername() : getCredentials();
        // Initialize the shared client explicitly: the GithubUtils getters otherwise self-initialize via
        // `initOctokit()`, which exits the process when no token is set — killing the build instead of
        // letting us fall back to building react-native from source.
        GithubUtils.initOctokitWithToken(credentials.githubToken);

        const version = await findMatchingArtifactsVersion(options, artifactId, credentials.githubToken);
        if (version == null) {
            logWarn(`${LOG_PREFIX} No matching artifacts version found for ${packageName}. Building react-native from source.`);
            return sourceBuild;
        }

        logInfo(`${LOG_PREFIX} Using patched react-native artifacts: ${packageName}:${version}`);
        return {
            buildFromSource: false,
            version,
            packageName,
            artifactId,
            artifactUrlPrefix: getArtifactUrlPrefix(packageName, artifactId, version),
            ...credentials,
        };
    } catch (error) {
        logError(`${LOG_PREFIX} ${error instanceof Error ? error.message : String(error)} Building react-native from source.`);
        return sourceBuild;
    }
}

export default resolveArtifacts;
export {ARTIFACT_IDS};
export type {AndroidResult, IosResult, Platform, ResolveOptions, ResolveResult};
