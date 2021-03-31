const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});

octokit.rest.issues.update({
    owner: GITHUB_OWNER,
    repo: EXPENSIFY_CASH_REPO,
    issue_number: issueNumber,
    state: 'open',
});

octokit.rest.issues.createComment({
    owner: GITHUB_OWNER,
    repo: EXPENSIFY_CASH_REPO,
    issue_number: issueNumber,
    body: core.getInput('COMMENT', {required: true}),
});
