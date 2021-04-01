const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const token = core.getInput('GITHUB_TOKEN', {required: true});
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const octokit = github.getOctokit(token, {required: true});

function getIssue() {
    return octokit.rest.issues.get({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
    });
}

async function checkUnfinishedTasks() {
    const issue = await getIssue();
    const body = issue.data.body || '';

    const pattern = /-\s\[\s]/g;
    const matches = pattern.exec(body);

    console.log({
        token,
        issueNumber,
        issue,
        body,
        matches,
    });

    core.setOutput('HAS_DEPLOY_BLOCKERS', matches !== null);
}

checkUnfinishedTasks();
