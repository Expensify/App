import * as core from '@actions/core';
import CONST from '@github/libs/CONST';
import {getLastClosedDeployChecklist} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';

/**
 * Duck-type check for an Octokit 404. We avoid `instanceof RequestError` because bundled
 * actions can contain multiple copies of that class and `instanceof` compares identity.
 */
function isNotFoundError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('status' in error)) {
        return false;
    }
    const status = (error as {status?: unknown}).status;
    return typeof status === 'number' && status === 404;
}

const run = async function (): Promise<void> {
    // getLastClosedDeployChecklist returns null when no closed checklist has ever existed
    // (first deploy cycle), and throws on actual API/network/parse errors. We only fail
    // open for the null case; errors propagate so the action fails and blocks the deploy.
    const checklist = await getLastClosedDeployChecklist();
    if (checklist === null) {
        console.log('No closed deploy checklist found yet (first deploy cycle), continuing with deploy');
        core.setOutput('HAS_PRODUCTION_RELEASE', true);
        return;
    }

    const {version} = checklist;
    console.log(`Last closed deploy checklist references version: ${version}`);

    if (!version) {
        // The checklist was found but the version could not be parsed — treat as an
        // unexpected state and block the deploy rather than silently skipping the check.
        core.setFailed('Could not extract version from the most recently closed deploy checklist');
        return;
    }

    // Production releases use the bare version as the tag (staging releases append "-staging"
    // and are flagged as pre-releases). A non-prerelease release for this tag confirms the
    // previous deploy cycle completed before we start a new staging cycle.
    try {
        const {data: release} = await GithubUtils.octokit.repos.getReleaseByTag({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            tag: version,
        });

        if (release.prerelease) {
            console.log(`Release for version ${version} is a pre-release, blocking deploy`);
            core.setOutput('HAS_PRODUCTION_RELEASE', false);
        } else {
            console.log(`Found production release for version ${version}`);
            core.setOutput('HAS_PRODUCTION_RELEASE', true);
        }
    } catch (err) {
        // A 404 means the tag simply doesn't exist yet — no production release for this version.
        // Any other error (5xx, rate-limit, auth) is an infrastructure problem; rethrow so the
        // action fails visibly rather than silently masquerading as "no production release".
        if (isNotFoundError(err)) {
            console.log(`No release found for version ${version}, blocking deploy`);
            core.setOutput('HAS_PRODUCTION_RELEASE', false);
        } else {
            throw err;
        }
    }
};

if (require.main === module) {
    run();
}

export default run;
