const core = require('@actions/core');
const github = require('@actions/github');
const GitUtils = require('expensify-common/lib/GitUtils.jsx');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const inputTag = core.getInput('TAG', {required: true});

console.log('Fetching release list from github...');
octokit.repos.listTags({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    per_page: 100,
})
    .catch(githubError => core.setFailed(githubError))
    .then((githubResponse) => {
        const tags = githubResponse.data.map(tag => tag.name);
        let priorTag;

        // Find release prior to the one with the tag matching the input tag
        tags.forEach((tag, index) => {
            if (tag == inputTag && index < tags.length - 1) {
                priorTag = tags[index + 1];
            }
        });

        if (priorTag == undefined) {
            core.setFailed('Given tag is not found in the last 100 release tags.');
            return;
        }

        console.log(`Given Release Tag: ${inputTag}`);
        console.log(`Prior Release Tag: ${priorTag}`);
        const gitUtils = new GitUtils();
        return gitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
    })
    .then(pullRequestList => core.setOutput('PR_LIST', pullRequestList))
    .catch(error => core.setFailed(error));
