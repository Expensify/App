const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');

const run = function () {
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));

    console.log('Checking for any open automerge PRs...');
    return octokit.issues.listForRepo({
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.EXPENSIFY_CASH_REPO,
        labels: GithubUtils.AUTOMERGE_LABEL,
        state: 'open',
    })
        .then(({data}) => {
            if (data.length > 0) {
                console.log('Found these open automerge pull requests:', _.pluck(data, 'html_url'));
                core.setOutput('OPEN_PR_FOUND', true);
            } else {
                console.log('Found no open automerge pull requests!');
                core.setOutput('OPEN_PR_FOUND', false);
            }
        })
        .catch((err) => {
            console.error('An error occurred trying to find PRs with the `automerge` label:', err);
            core.setFailed(err);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
