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

            // Check the issue description to see if there are any unfinished/un-QAed items in the checklist.
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
                per_page: 100,
            });
        })
        .then((comments) => {
            console.log('Checking the last comment for the :shipit: seal of approval', comments);

            // If comments is undefined that means we found an unchecked QA item in the
            // issue description, so there's nothing more to do but return early.
            if (_.isUndefined(comments)) {
                return;
            }

            // If there are no comments, then we have not yet gotten the :shipit: seal of approval.
            if (_.isEmpty(comments.data)) {
                console.log('No comments found on issue');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
                return;
            }

            console.log('Verifying that the last comment is the :shipit: seal of approval');
            const lastComment = comments.data.pop();
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
