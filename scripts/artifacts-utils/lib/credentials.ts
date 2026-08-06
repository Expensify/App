import GithubUtils from '@github/libs/GithubUtils';

import {getCredentials as getCredentialsFromCLI} from './githubCLI';

/**
 * Credentials for reading our published artifacts from GitHub Packages: from the environment in CI,
 * from the gh CLI on developer machines. Every consumer authenticates through here, so a missing
 * credential always fails the same way, with the same message.
 */

/** A token authenticates every read; this is all iOS's curl Bearer download needs. */
type Credentials = {githubToken: string};
/** Android additionally needs the username, for Gradle's Maven `credentials {}` block. */
type CredentialsWithUsername = Credentials & {githubUsername: string};

type RawCredentials = {githubToken: string | null; githubUsername: string | null};

function isCI(): boolean {
    return process.env.CI != null;
}

/** Reads a non-empty environment variable, or null. */
function getEnvVar(name: string): string | null {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Reading from the gh CLI spawns processes, so each caller below reads exactly once. */
function read(): RawCredentials {
    if (isCI()) {
        return {githubToken: getEnvVar('GITHUB_TOKEN'), githubUsername: getEnvVar('GITHUB_ACTOR')};
    }
    return getCredentialsFromCLI();
}

/** Throws when no token is available. */
function getCredentials(): Credentials {
    const {githubToken} = read();
    if (githubToken == null) {
        throw new Error('Missing GitHub token (set GITHUB_TOKEN in CI, or run `gh auth login` locally).');
    }
    return {githubToken};
}

/** Throws when either the token or the username is unavailable. */
function getCredentialsWithUsername(): CredentialsWithUsername {
    const {githubToken, githubUsername} = read();
    if (githubToken == null || githubUsername == null) {
        throw new Error('Missing GitHub credentials (set GITHUB_TOKEN and GITHUB_ACTOR in CI, or run `gh auth login` locally).');
    }
    return {githubToken, githubUsername};
}

/**
 * Initializes the shared Octokit client (with GithubUtils' throttling and pagination plugins).
 * Must run before touching `GithubUtils.octokit`/`paginate`: those getters otherwise self-initialize
 * via `initOctokit()`, which exits the process when no token is set — killing the build instead of
 * letting the caller fall back to building react-native from source.
 */
function initGithubClient(githubToken: string) {
    GithubUtils.initOctokitWithToken(githubToken);
}

export {getCredentials, getCredentialsWithUsername, initGithubClient};
export type {Credentials, CredentialsWithUsername};
