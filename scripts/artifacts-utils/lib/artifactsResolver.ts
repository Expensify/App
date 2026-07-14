import {isRecord} from '@libs/ObjectUtils';

import {getOctokit} from '@actions/github';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Shared resolver for Expensify's patched React Native prebuilt artifacts.
 * Resolves which artifact version to use by matching the local patches hash
 * against the `patchesHash` recorded in each candidate's Maven POM. Consumed via
 * `resolve-artifacts.ts` by Gradle (Android) and `patched_ios_artifacts.rb` (iOS).
 */

type Platform = 'ios' | 'android';

/** Base credentials — a token authenticates every download. */
type Credentials = {githubToken: string};
/** iOS's curl Bearer download needs only the token. */
type IosCredentials = Credentials;
/** Android's Gradle Maven `credentials {}` block additionally requires the username. */
type AndroidCredentials = Credentials & {githubUsername: string};

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
} & Creds;

type IosResult = SourceBuild | Prebuilt<IosCredentials>;
type AndroidResult = SourceBuild | Prebuilt<AndroidCredentials>;
type ResolveResult = IosResult | AndroidResult;

const GITHUB_REPO = 'Expensify/App';
const GITHUB_OWNER = 'Expensify';

const ARTIFACT_IDS = {
    android: 'react-android',
    ios: 'react-native-artifacts',
} satisfies Record<Platform, string>;

/** Logs go to stderr; stdout is reserved for the JSON result. */
function logError(message: string) {
    process.stderr.write(`[PatchedArtifacts] ${message}\n`);
}

/** Credentials as read from the source; fields are validated per platform by the callers. */
type RawCredentials = {githubToken: string | null; githubUsername: string | null};

function isCI(): boolean {
    return process.env.CI != null;
}

/** Reads a non-empty environment variable, or null. */
function getEnvVar(name: string): string | null {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Runs a `gh` command and returns its trimmed output, or null on failure/empty. */
function getGh(args: string[]): string | null {
    try {
        const output = execFileSync('gh', args, {encoding: 'utf8'}).trim();
        return output.length > 0 ? output : null;
    } catch {
        return null;
    }
}

function hasGithubCLI(): boolean {
    try {
        execFileSync('which', ['gh'], {stdio: 'ignore'});
        return true;
    } catch {
        return false;
    }
}

function hasRequiredScopes(): boolean {
    try {
        const status = execFileSync('gh', ['auth', 'status'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).toString();
        return status.includes('read:packages');
    } catch {
        return false;
    }
}

/**
 * In CI credentials come from the environment (no gh CLI). Locally they come from
 * the gh CLI, which must be installed and scoped for read:packages.
 */
function readCredentials(): RawCredentials | null {
    if (isCI()) {
        return {githubToken: getEnvVar('GITHUB_TOKEN'), githubUsername: getEnvVar('GITHUB_ACTOR')};
    }
    if (!hasGithubCLI()) {
        logError('No GitHub CLI found.');
        return null;
    }
    if (!hasRequiredScopes()) {
        logError('GitHub token does not have required scope read:packages.');
        return null;
    }
    return {githubToken: getGh(['auth', 'token']), githubUsername: getGh(['api', 'user', '--jq', '.login'])};
}

function getIosCredentials(): IosCredentials | null {
    const credentials = readCredentials();
    if (credentials == null || credentials.githubToken == null) {
        logError('Missing GitHub token.');
        return null;
    }
    return {githubToken: credentials.githubToken};
}

function getAndroidCredentials(): AndroidCredentials | null {
    const credentials = readCredentials();
    if (credentials == null || credentials.githubToken == null || credentials.githubUsername == null) {
        logError('Missing GitHub credentials (username and/or token).');
        return null;
    }
    return {githubToken: credentials.githubToken, githubUsername: credentials.githubUsername};
}

function mavenPomUrl(packageName: string, artifactId: string, version: string): string {
    return `https://maven.pkg.github.com/${GITHUB_REPO}/com/expensify/${packageName}/${artifactId}/${version}/${artifactId}-${version}.pom`;
}

function buildAuthHeaders(githubToken: string | null): Record<string, string> {
    return githubToken ? {Authorization: `Bearer ${githubToken}`} : {};
}

/**
 * GitHub Packages 302-redirects to a signed object-store URL on a different host.
 * `fetch` follows the redirect and drops the Authorization header on the
 * cross-origin hop, so the token reaches only the initial host, never the object store.
 */
async function fetchTokenSafe(url: string, githubToken: string | null): Promise<string> {
    const response = await fetch(url, {headers: buildAuthHeaders(githubToken)});
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

async function getArtifactsCandidates(packageName: string, artifactId: string, rnVersion: string, githubToken: string): Promise<string[]> {
    const octokit = getOctokit(githubToken);
    /* eslint-disable @typescript-eslint/naming-convention -- GitHub REST API params are snake_case */
    const versions = await octokit.paginate(octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg, {
        package_type: 'maven',
        org: GITHUB_OWNER,
        package_name: `com.expensify.${packageName}.${artifactId}`,
        per_page: 100,
    }); /* eslint-enable @typescript-eslint/naming-convention */
    return versions.map((version) => version.name).filter((name) => name.startsWith(rnVersion));
}

async function getRemotePatchesHash(packageName: string, artifactId: string, version: string, githubToken: string): Promise<string | null> {
    const pom = await fetchTokenSafe(mavenPomUrl(packageName, artifactId, version), githubToken);
    return pom.match(/<patchesHash>([^<]+)<\/patchesHash>/)?.[1]?.trim() ?? null;
}

async function findMatchingArtifactsVersion(options: ResolveOptions, artifactId: string, githubToken: string): Promise<string | null> {
    const {packageName, newDotRoot, isHybrid} = options;
    try {
        const localPatchesHash = computePatchesHash(newDotRoot, isHybrid);
        const rnVersion = getReactNativeVersion(newDotRoot);
        const candidates = await getArtifactsCandidates(packageName, artifactId, rnVersion, githubToken);
        for (const candidate of candidates) {
            const remoteHash = await getRemotePatchesHash(packageName, artifactId, candidate, githubToken);
            if (remoteHash != null && remoteHash === localPatchesHash) {
                return candidate;
            }
        }
        return null;
    } catch (error) {
        logError(`Failed to find matching artifacts version for ${packageName}. Reason: ${String(error)}`);
        return null;
    }
}

async function resolveWithCredentials<Creds extends Credentials>(
    options: ResolveOptions,
    artifactId: string,
    credentials: Creds | null,
    sourceBuild: SourceBuild,
): Promise<SourceBuild | Prebuilt<Creds>> {
    if (!credentials) {
        return sourceBuild;
    }
    const version = await findMatchingArtifactsVersion(options, artifactId, credentials.githubToken);
    if (version == null) {
        logError(`No matching artifacts version found for ${options.packageName}. Building react-native from source.`);
        return sourceBuild;
    }
    logError(`Using patched react-native artifacts: ${options.packageName}:${version}`);
    return {buildFromSource: false, version, packageName: options.packageName, artifactId, ...credentials};
}

/**
 * Resolves whether a matching prebuilt artifact exists for the current patches.
 * Returns a `SourceBuild` (no secrets) when no match is found or credentials are
 * unavailable, otherwise a `Prebuilt` carrying the credentials the native
 * download needs — token only for iOS, username + token for Android.
 */
function resolveArtifacts(options: ResolveOptions & {platform: 'ios'}): Promise<IosResult>;
function resolveArtifacts(options: ResolveOptions & {platform: 'android'}): Promise<AndroidResult>;
function resolveArtifacts(options: ResolveOptions): Promise<ResolveResult> {
    const artifactId = ARTIFACT_IDS[options.platform];
    const sourceBuild: SourceBuild = {buildFromSource: true, version: null, packageName: options.packageName, artifactId};

    if (options.platform === 'ios') {
        return resolveWithCredentials(options, artifactId, getIosCredentials(), sourceBuild);
    }
    return resolveWithCredentials(options, artifactId, getAndroidCredentials(), sourceBuild);
}

export default resolveArtifacts;
export {ARTIFACT_IDS};
export type {Platform, ResolveOptions, ResolveResult, IosResult, AndroidResult};
