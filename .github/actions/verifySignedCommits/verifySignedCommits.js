const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GitHubUtils = require('../../libs/GithubUtils');

const PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || github.context.payload.pull_request.number;

GitHubUtils.octokit.pulls.listCommits({
    owner: GitHubUtils.GITHUB_OWNER,
    repo: GitHubUtils.APP_REPO,
    pull_number: PR_NUMBER,
})
    .then(({data}) => {
        const unsignedCommits = _.filter(data, datum => !datum.commit.verification.verified);

        if (!_.isEmpty(unsignedCommits)) {
            const errorMessage = `Error: the following commits are unsigned: ${JSON.stringify(_.map(unsignedCommits, commitObj => commitObj.sha))}`;
            console.error(errorMessage);
            core.setFailed(errorMessage);
        } else {
            console.log('All commits signed! 🎉');
        }
    });
