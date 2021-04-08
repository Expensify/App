const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const run = function () {
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
    const issueNumber = Number(core.getInput('ISSUE_NUMBER', {required: true}));

    console.log(`Fetching issue number ${issueNumber}`);

    return octokit.issues.get({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
    })
        .then(({data}) => {
            console.log('Checking for unverified PRs or unresolved deploy blockers', data);
            const uncheckedBoxRegex = /-\s\[\s]/g;
            const matches = uncheckedBoxRegex.exec(data.body);
            if (matches !== null) {
                console.log('An unverified PR or unresolved deploy blocker was found.');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
                return;
            }

            return octokit.issues.listComments({
                owner: GITHUB_OWNER,
                repo: EXPENSIFY_CASH_REPO,
                issue_number: issueNumber,
            });
        })
        .then((comments) => {
            console.log('Checking the last comment for the :shipit: seal of approval', comments);

            if (_.isUndefined(comments)) {
                return;
            }

            if (_.isEmpty(comments.data)) {
                console.log('No comments found on issue');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
                return;
            }

            console.log('Verifying that the last comment is :shipit:');
            const lastComment = comments.data[comments.data.length - 1];
            const shipItRegex = /^:shipit:/g;
            if (_.isNull(shipItRegex.exec(lastComment.body))) {
                console.log('The last comment on the issue was not :shipit');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
            } else {
                console.log('Everything looks good, there are no deploy blockers!');
                core.setOutput('HAS_DEPLOY_BLOCKERS', false);
            }
        })
        .catch((error) => {
            console.error('A problem occurred while trying to communicate with the GitHub API', error);
            core.setFailed(error);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
