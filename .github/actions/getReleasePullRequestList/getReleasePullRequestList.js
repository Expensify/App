const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GitUtils = require('../../libs/GitUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const inputTag = core.getInput('TAG', {required: true});

console.log('Fetching release list from github...');
octokit.repos.listReleases({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
})
    .catch(githubError => core.setFailed(githubError))
    .then(({data}) => {
        const tags = _.pluck(data, 'tag_name');
        const priorTagIndex = _.indexOf(tags, inputTag) + 1;

        if (priorTagIndex === 0) {
            console.log(`No release was found for input tag ${inputTag}. Comparing it to latest release ${tags[0]}`);
        }

        if (priorTagIndex === tags.length) {
            const err = new Error('Somehow, the input tag was at the end of the paginated result, '
                                  + "so we don't have the prior tag.");
            console.error(err.message);
            core.setFailed(err);
            return;
        }

        const priorTag = tags[priorTagIndex];
        console.log(`Given Release Tag: ${inputTag}`);
        console.log(`Prior Release Tag: ${priorTag}`);

        return GitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
    })
    .then(pullRequestList => core.setOutput('PR_LIST', pullRequestList))
    .catch(error => core.setFailed(error));
