const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GitUtils = require('../../libs/GitUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const inputTag = core.getInput('TAG', {required: true});

console.log('Fetching release list from github...');
octokit.repos.listTags({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
})
    .catch(githubError => core.setFailed(githubError))
    .then(({data}) => {
        const tags = _.pluck(data, 'name');

        const priorTagIndex = _.indexOf(tags, inputTag) + 1;
        if (priorTagIndex === 0 || priorTagIndex === tags.length) {
            core.setFailed('Given tag is not found in the last 30 release tags.');
            return;
        }
        const priorTag = tags[priorTagIndex];
        console.log(`Given Release Tag: ${inputTag}`);
        console.log(`Prior Release Tag: ${priorTag}`);

        const gitUtils = new GitUtils();
        return gitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
    })
    .then(pullRequestList => core.setOutput('PR_LIST', pullRequestList))
    .catch(error => core.setFailed(error));
