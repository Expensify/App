import core from '@actions/core';
import github from '@actions/github';
import CONST from '../../../libs/CONST';
import GitHubUtils from '../../../libs/GithubUtils';

type CommitData = {
    commit: {
        verification: {
            verified: boolean;
        };
    };
    sha: string;
};

type Commit = {
    data: CommitData[];
};

const PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || github.context.payload.pull_request?.number;

GitHubUtils.octokit.pulls
    .listCommits({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: PR_NUMBER,
    })
    .then(({data}: Commit) => {
        const unsignedCommits = data.filter((datum) => !datum.commit.verification.verified);

        if (unsignedCommits.length > 0) {
            const errorMessage = `Error: the following commits are unsigned: ${JSON.stringify(unsignedCommits.map((commitObj) => commitObj.sha))}`;
            console.error(errorMessage);
            core.setFailed(errorMessage);
        } else {
            console.log('All commits signed! 🎉');
        }
    });
