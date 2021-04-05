const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const run = function () {
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
    const issueNumber = Number(core.getInput('ISSUE_NUMBER', {required: true}));
    let hasDeployBlockers = false;

    return octokit.rest.issues.get({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
    })
        .then((issue) => {
            const body = issue.data.body || '';
            const pattern = /-\s\[\s]/g;
            const matches = pattern.exec(body);
            hasDeployBlockers = matches !== null;

            return issue.data;
        })
        .then(() => {
            if (!hasDeployBlockers) {
                return octokit.rest.issues.listComments({
                    owner: GITHUB_OWNER,
                    repo: EXPENSIFY_CASH_REPO,
                    issue_number: issueNumber,
                })
                    .then((comments) => {
                        const lastComment = comments.data[comments.data.length - 1];
                        const shipItRegex = /:shipit:/g;
                        hasDeployBlockers = shipItRegex.exec(lastComment.body) === null;
                    });
            }
        })
        .then(() => {
            core.setOutput('HAS_DEPLOY_BLOCKERS', hasDeployBlockers);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
