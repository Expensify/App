import * as core from '@actions/core';
import * as github from '@actions/github';
import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';

const PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || github.context.payload.pull_request?.number;

GitHubUtils.paginate(
    GitHubUtils.octokit.pulls.listCommits,
    {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: PR_NUMBER ?? 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: 100,
    },
    (response) => response.data,
).then((commits) => {
    const unsignedCommits = commits.filter((commit) => !commit.commit.verification?.verified);

    if (unsignedCommits.length > 0) {
        const errorMessage = `Error: the following commits are unsigned: ${JSON.stringify(unsignedCommits.map((commitObj) => commitObj.sha))}`;
        console.error(errorMessage);
        core.setFailed(errorMessage);
    } else {
        console.log('All commits signed! 🎉');
    }
});
