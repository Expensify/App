const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const githubUtils = new GithubUtils(octokit);

githubUtils.getStagingDeployCash()
    .then(({labels}) => core.setOutput('IS_LOCKED', _.contains(labels, '🔐 LockCashDeploys 🔐')));
