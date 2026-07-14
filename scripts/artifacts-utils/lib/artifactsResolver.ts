import {execFileSync} from 'child_process';
import fs from 'fs';
import https from 'https';
import path from 'path';

/**
 * Shared resolver for Expensify's patched React Native prebuilt artifacts.
 *
 * This is the platform-agnostic "brain" ported from the Android-only
 * `ExpensiUtils.gradle`. It ONLY resolves which artifact version to use
 * (by matching the local patches hash against the `patchesHash` recorded in
 * each candidate's Maven POM). It never downloads the artifact itself — that
 * stays native to each build system (Gradle Maven for Android, curl for iOS).
 *
 * All runtime-specific inputs (the Hermes V1 flag, isHybrid, package name) are
 * passed IN by the caller — the caller's build system already knows them, so we
 * never parse `gradle.properties`/`Podfile` here.
 *
 * Consumed by:
 *  - Android: `scripts/artifacts-utils/android/ExpensiUtils.gradle` (via exec)
 *  - iOS:     `scripts/artifacts-utils/ios/patched_ios_artifacts.rb` (via exec)
 */

type Platform = 'ios' | 'android';

type Credentials = {githubUsername: string; githubToken: string};

type ResolveOptions = {
    platform: Platform;
    packageName: string;
    newDotRoot: string;
    isHybrid: boolean;
};

type ResolveResult = {
    buildFromSource: boolean;
    version: string | null;
    packageName: string;
    artifactId: string;
};

const GITHUB_REPO = 'Expensify/App';
const GITHUB_OWNER = 'Expensify';

/** The only Maven coordinate that differs per platform. */
const ARTIFACT_IDS: Record<Platform, string> = {
    android: 'react-android',
    ios: 'react-native-artifacts',
};

/** All human-facing logs MUST go to stderr — stdout is reserved for the JSON result. */
function logError(message: string) {
    process.stderr.write(`[PatchedArtifacts] ${message}\n`);
}

function runGh(args: string[]): string {
    return execFileSync('gh', args, {encoding: 'utf8'}).trim();
}

function isCI(): boolean {
    return process.env.CI != null;
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
    const status = execFileSync('gh', ['auth', 'status'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).toString();
    return status.includes('read:packages');
}

function getCredentials(): Credentials | null {
    try {
        if (!hasGithubCLI()) {
            logError('No GitHub CLI found.');
            return null;
        }
        if (isCI()) {
            // typeof narrows the (loosely-typed) process.env members to string without assigning an any value.
            if (typeof process.env.GITHUB_ACTOR === 'string' && typeof process.env.GITHUB_TOKEN === 'string') {
                return {githubUsername: process.env.GITHUB_ACTOR, githubToken: process.env.GITHUB_TOKEN};
            }
            logError('Missing required CI environment variables GITHUB_ACTOR and/or GITHUB_TOKEN.');
            return null;
        }
        if (!hasRequiredScopes()) {
            logError('GitHub token does not have required scope read:packages.');
            return null;
        }
        // `--jq .login` returns the login string directly, so there is no untyped JSON to assert on.
        return {
            githubUsername: runGh(['api', 'user', '--jq', '.login']),
            githubToken: runGh(['auth', 'token']),
        };
    } catch {
        logError('Failed to get GitHub credentials. This might be due to an expired token or not being logged in.');
        return null;
    }
}

function mavenPomUrl(packageName: string, artifactId: string, version: string): string {
    return `https://maven.pkg.github.com/${GITHUB_REPO}/com/expensify/${packageName}/${artifactId}/${version}/${artifactId}-${version}.pom`;
}

function mavenVersionsApiUrl(packageName: string, artifactId: string): string {
    return `/orgs/${GITHUB_OWNER}/packages/maven/com.expensify.${packageName}.${artifactId}/versions`;
}

/**
 * GitHub Packages returns a 302 to a signed object-store URL. We send the token
 * ONLY to maven.pkg.github.com and never follow the redirect with it attached,
 * so the token is never leaked to the redirect host.
 */
function fetchTokenSafe(url: string, githubToken: string | null, maxRedirects = 5): Promise<string> {
    return new Promise((resolve, reject) => {
        if (maxRedirects < 0) {
            reject(new Error(`Too many redirects fetching ${url}`));
            return;
        }
        const headers = githubToken ? {Authorization: `Bearer ${githubToken}`} : {};
        https
            .get(url, {headers}, (res) => {
                const {statusCode = 0, headers: resHeaders} = res;
                if (statusCode >= 300 && statusCode < 400 && resHeaders.location) {
                    res.resume(); // drain
                    // Follow the redirect WITHOUT the token.
                    const nextUrl = new URL(resHeaders.location, url).toString();
                    fetchTokenSafe(nextUrl, null, maxRedirects - 1).then(resolve, reject);
                    return;
                }
                if (statusCode < 200 || statusCode >= 300) {
                    res.resume();
                    reject(new Error(`Request to ${url} failed with status ${statusCode}`));
                    return;
                }
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk: string) => (body += chunk));
                res.on('end', () => resolve(body));
            })
            .on('error', reject);
    });
}

function getReactNativeVersion(newDotRoot: string): string {
    const parsed: unknown = JSON.parse(fs.readFileSync(path.join(newDotRoot, 'package.json'), 'utf8'));
    if (typeof parsed === 'object' && parsed !== null && 'dependencies' in parsed) {
        const deps: unknown = parsed.dependencies;
        if (typeof deps === 'object' && deps !== null && 'react-native' in deps) {
            const version: unknown = deps['react-native'];
            if (typeof version === 'string') {
                return version;
            }
        }
    }
    throw new Error('Could not read react-native version from package.json');
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

function getArtifactsCandidates(packageName: string, artifactId: string, rnVersion: string): string[] {
    const output = runGh(['api', '--paginate', mavenVersionsApiUrl(packageName, artifactId), '--jq', '.[].name']);
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((name) => name.startsWith(rnVersion));
}

async function getRemotePatchesHash(packageName: string, artifactId: string, version: string, githubToken: string): Promise<string | null> {
    const pom = await fetchTokenSafe(mavenPomUrl(packageName, artifactId, version), githubToken);
    // The publish step writes <patchesHash> into the POM <properties> block.
    return pom.match(/<patchesHash>([^<]+)<\/patchesHash>/)?.[1]?.trim() ?? null;
}

async function findMatchingArtifactsVersion(options: ResolveOptions, artifactId: string, githubToken: string): Promise<string | null> {
    const {packageName, newDotRoot, isHybrid} = options;
    try {
        const localPatchesHash = computePatchesHash(newDotRoot, isHybrid);
        const rnVersion = getReactNativeVersion(newDotRoot);
        const candidates = getArtifactsCandidates(packageName, artifactId, rnVersion);
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

/**
 * Resolves whether a matching prebuilt artifact exists for the current patches.
 * Returns `buildFromSource: true` (a normal outcome, not an error) whenever no
 * match is found or credentials are unavailable.
 */
async function resolveArtifacts(options: ResolveOptions): Promise<ResolveResult> {
    const artifactId = ARTIFACT_IDS[options.platform];
    const base: ResolveResult = {buildFromSource: true, version: null, packageName: options.packageName, artifactId};

    const credentials = getCredentials();
    if (!credentials) {
        return base;
    }

    const version = await findMatchingArtifactsVersion(options, artifactId, credentials.githubToken);
    if (!version) {
        logError(`No matching artifacts version found for ${options.packageName}. Building react-native from source.`);
        return base;
    }

    logError(`Using patched react-native artifacts: ${options.packageName}:${version}`);
    return {...base, buildFromSource: false, version};
}

export default resolveArtifacts;
export {ARTIFACT_IDS, fetchTokenSafe};
export type {Platform, ResolveOptions, ResolveResult};
