import * as core from '@actions/core';
import type {components as OctokitComponents} from '@octokit/openapi-types';
import * as ActionUtils from '@github/libs/ActionUtils';
import GithubUtils from '@github/libs/GithubUtils';

type GitHubPR = OctokitComponents['schemas']['pull-request-simple'];

// Parse the stringified JSON array of PR numbers, and cast each from String -> Number
const PRList = ActionUtils.getJSONInput('PR_LIST', {required: true}) as number[];
console.log('Got PR list: ', String(PRList));

/**
 * Generate the well-formatted body of a production release.
 */
function getReleaseBody(pullRequests: GitHubPR[]): string {
    return pullRequests.map((pr) => `- ${pr.title} by ${pr.user?.login ?? 'unknown'} in ${pr.html_url}`).join('\r\n');
}

async function run() {
    const allPRs = await GithubUtils.fetchAllPullRequests(PRList);
    if (!allPRs) {
        core.setFailed(`something went wrong getting PRList ${JSON.stringify(PRList)}`);
        return;
    }
    const releaseBody = getReleaseBody(allPRs);
    console.log(`Generated release body: ${releaseBody}`);
    core.setOutput('RELEASE_BODY', releaseBody);
}

if (require.main === module) {
    run();
}
