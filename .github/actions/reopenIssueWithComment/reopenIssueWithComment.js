const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});

octokit.rest.issues.update({
    owner: GithubUtils.GITHUB_OWNER,
    repo: GithubUtils.EXPENSIFY_CASH_REPO,
    issue_number: issueNumber,
    state: 'open',
});

octokit.rest.issues.createComment({
    owner: GithubUtils.GITHUB_OWNER,
    repo: GithubUtils.EXPENSIFY_CASH_REPO,
    issue_number: issueNumber,
    body: core.getInput('COMMENT', {required: true}),
});
