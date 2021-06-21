const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const ActionUtils = require('../../libs/ActionUtils');
const GitUtils = require('../../libs/GitUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const inputTag = core.getInput('TAG', {required: true});

const isProductionDeploy = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
const itemToFetch = isProductionDeploy ? 'release' : 'tag';

/**
 * Gets either releases or tags for a GitHub repo
 *
 * @param {boolean} fetchReleases
 * @returns {*}
 */
function getTagsOrReleases(fetchReleases) {
    if (fetchReleases) {
        return octokit.repos.listReleases({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
    }

    return octokit.repos.listTags({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
}

console.log(`Fetching ${itemToFetch} list from github...`);
getTagsOrReleases(isProductionDeploy)
    .catch(githubError => core.setFailed(githubError))
    .then(({data}) => {
        const keyToPluck = isProductionDeploy ? 'tag_name' : 'name';
        const tags = _.pluck(data, keyToPluck);
        const priorTagIndex = _.indexOf(tags, inputTag) + 1;

        if (priorTagIndex === 0) {
            console.log(`No ${itemToFetch} was found for input tag ${inputTag}.`
                + `Comparing it to latest ${itemToFetch} ${tags[0]}`);
        }

        if (priorTagIndex === tags.length) {
            const err = new Error('Somehow, the input tag was at the end of the paginated result, '
                + 'so we don\'t have the prior tag');
            console.error(err.message);
            core.setFailed(err);
            return;
        }

        const priorTag = tags[priorTagIndex];
        console.log(`Given ${itemToFetch}: ${inputTag}`);
        console.log(`Prior ${itemToFetch}: ${priorTag}`);

        const pullRequestList = GitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
        console.log(`Found the pull request list: ${pullRequestList}`);
        return core.setOutput('PR_LIST', pullRequestList);
    })
    .catch(error => core.setFailed(error));
