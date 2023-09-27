import * as core from '@actions/core';
import * as github from '@actions/github';
import * as CONST from '../../../libs/CONST';
import * as GitHubUtils from '../../../libs/GithubUtils';

// eslint-disable-next-line @typescript-eslint/naming-convention
const {pull_request} = github.context.payload;
const {number: pullRequestNumber} = pull_request ?? {};

const PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || pullRequestNumber;

GitHubUtils.octokit.pulls
    .listCommits({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: PR_NUMBER,
    })
    .then(({data}: {data: Array<{commit: {verification: {verified: boolean}}; sha: string}>}) => {
        const unsignedCommits = data.filter((datum) => !datum.commit.verification.verified);

        if (unsignedCommits.length > 0) {
            const errorMessage = `Error: the following commits are unsigned: ${JSON.stringify(unsignedCommits.map((commitObj) => commitObj.sha))}`;
            console.error(errorMessage);
            core.setFailed(errorMessage);
        } else {
            console.log('All commits signed! 🎉');
        }
    });
