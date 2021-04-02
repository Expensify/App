const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const token = core.getInput('GITHUB_TOKEN', {required: true});
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const octokit = github.getOctokit(token, {required: true});

function checkDeployBlockers() {
    return octokit.rest.issues.get({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
    })
        .then((issue) => {
            const body = issue.data.body || '';
            const pattern = /-\s\[\s]/g;
            const matches = pattern.exec(body);
            core.setOutput('HAS_DEPLOY_BLOCKERS', matches !== null);
        });
}

checkDeployBlockers()
    .then(() => {
        console.log('The checkDeployBlockers action ran successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Something went wrong. The checkDeployBlockers action did not run successfully', err);
        core.setFailed(err);
    });
