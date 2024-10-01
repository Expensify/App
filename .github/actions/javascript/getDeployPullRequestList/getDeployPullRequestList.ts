import * as core from '@actions/core';
import * as github from '@actions/github';
import {getJSONInput} from '@github/libs/ActionUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

async function run() {
    try {
        const inputTag = core.getInput('TAG', {required: true});
        const isProductionDeploy = !!getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
        const deployEnv = isProductionDeploy ? 'production' : 'staging';

        console.log(`Looking for PRs deployed to ${deployEnv} in ${inputTag}...`);

        let priorTag: string | undefined;
        let foundCurrentRelease = false;
        await GithubUtils.paginate(
            GithubUtils.octokit.repos.listReleases,
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                per_page: 100,
            },
            ({data}, done) => {
                // For production deploys, look only at other production deploys.
                // staging deploys can be compared with other staging deploys or production deploys.
                // The reason is that the final staging release in each deploy cycle will BECOME a production release
                const filteredData = isProductionDeploy ? data.filter((release) => !release.prerelease) : data;

                // Release was in the last page, meaning the previous release is the first item in this page
                if (foundCurrentRelease) {
                    priorTag = data.at(0)?.tag_name;
                    done();
                    return filteredData;
                }

                // Search for the index of input tag
                const indexOfCurrentRelease = filteredData.findIndex((release) => release.tag_name === inputTag);

                // If it happens to be at the end of this page, then the previous tag will be in the next page.
                // Set a flag showing we found it so we grab the first release of the next page
                if (indexOfCurrentRelease === filteredData.length - 1) {
                    foundCurrentRelease = true;
                    return filteredData;
                }

                // If it's anywhere else in this page, the the prior release is the next item in the page
                if (indexOfCurrentRelease >= 0) {
                    priorTag = filteredData.at(indexOfCurrentRelease + 1)?.tag_name;
                    done();
                }

                // Release not in this page (or we're done)
                return filteredData;
            },
        );

        if (!priorTag) {
            throw new Error('Something went wrong and the prior tag could not be found.');
        }

        console.log(`Looking for PRs deployed to ${deployEnv} between ${priorTag} and ${inputTag}`);
        const prList = await GitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
        console.log('Found the pull request list: ', prList);
        core.setOutput('PR_LIST', prList);
    } catch (error) {
        console.error((error as Error).message);
        core.setFailed(error as Error);
    }
}

if (require.main === module) {
    run();
}

export default run;
