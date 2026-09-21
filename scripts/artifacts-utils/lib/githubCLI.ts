import {isRecord} from '@libs/ObjectUtils';

import {execFileSync} from 'child_process';

/**
 * Thin wrappers around the gh CLI, used only on developer machines — in CI the credentials come from
 * the environment. Kept in its own module so that "how do we get local credentials" has one home, and
 * so a misconfigured setup surfaces as an actionable message instead of a raw 403 in the middle of a
 * pod install or a gradle sync.
 */

const SETUP_DOCS_URL = 'https://github.com/Expensify/App/blob/main/contributingGuides/PREBUILT_REACT_NATIVE_ARTIFACTS.md';

/** Thrown when the local gh CLI can't provide usable credentials. Always points at the setup instructions. */
class GithubCLISetupError extends Error {
    constructor(message: string) {
        super(`${message} For setup instructions, refer to: ${SETUP_DOCS_URL}`);
        this.name = 'GithubCLISetupError';
    }
}

/** Runs a gh command and returns its trimmed output. Throws with an actionable message on any failure. */
function run(args: string[]): string {
    let output: string;
    try {
        output = execFileSync('gh', args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
    } catch (error) {
        // ENOENT means the gh binary isn't on PATH at all; anything else is a command that failed.
        const isMissingCLI = isRecord(error) && error.code === 'ENOENT';
        throw new GithubCLISetupError(isMissingCLI ? 'No GitHub CLI found.' : `\`gh ${args.join(' ')}\` failed.`);
    }
    if (output.length === 0) {
        throw new GithubCLISetupError(`\`gh ${args.join(' ')}\` returned no output.`);
    }
    return output;
}

/**
 * Reading our Maven packages requires this scope, and a token without it only fails once we hit the API.
 */
function assertReadPackagesScope() {
    const scopes = run(['auth', 'status']);
    if (scopes.includes('read:packages') || scopes.includes('write:packages')) {
        return;
    }
    throw new GithubCLISetupError('GitHub token does not have the required scope read:packages.');
}

/** Local credentials from the gh CLI. Throws unless the CLI is installed, authenticated and scoped. */
function getCredentials(): {githubToken: string; githubUsername: string} {
    assertReadPackagesScope();
    return {githubToken: run(['auth', 'token']), githubUsername: run(['api', 'user', '--jq', '.login'])};
}

export {getCredentials, GithubCLISetupError, SETUP_DOCS_URL};
