const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');

const prList = JSON.parse(core.getInput('PR_LIST', {required: true}));
const isProd = JSON.parse(
    core.getInput('IS_PRODUCTION_DEPLOY', {required: true}),
);
const token = core.getInput('GITHUB_TOKEN', {required: true});
const date = new Date();
const message = `🚀 Deployed 🚀 to ${
    isProd ? 'production' : 'staging'
} on ${date.toDateString()} at ${date.toTimeString()}`;

const octokit = github.getOctokit(token);
const githubUtils = new GithubUtils(octokit);

/**
 * Create comment on each pull request
 */
prList.forEach((pr) => {
    githubUtils.createComment(github.context.repo.repo, pr, message, octokit)
        .then(() => {
            console.log(`Comment created on #${pr} successfully 🎉`);
        })
        .catch((err) => {
            console.log(`Unable to write comment on #${pr} 😞`);
            core.setFailed(err.message);
        });
});
