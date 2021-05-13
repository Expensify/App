const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../libs/GithubUtils');
const promiseWhile = require('../../libs/promiseWhile');

const run = function () {
    const pullRequestNumber = Number(core.getInput('PULL_REQUEST_NUMBER', {required: true}));

    const MAX_RETRIES = 30;
    let retryCount = 0;
    let isMergeable = false;
    let mergeabilityResolved = false;
    console.log(`Checking the mergeability of PR #${pullRequestNumber}`);
    return promiseWhile(
        () => !mergeabilityResolved && retryCount < MAX_RETRIES,
        _.throttle(() => GithubUtils.octokit.pulls.get({
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.EXPENSIFY_CASH_REPO,
            pull_number: pullRequestNumber,
        })
            .then(({data}) => {
                if (!_.isNull(data.mergeable)) {
                    console.log('Pull request mergeability is not yet resolved...');
                    retryCount++;
                    mergeabilityResolved = true;
                    isMergeable = data.mergeable;
                }
            })
            .catch((githubError) => {
                mergeabilityResolved = true;
                console.error(`An error occurred fetching the PR from Github: ${JSON.stringify(githubError)}`);
                core.setFailed(githubError);
            }), 5000),
    )
        .then(() => {
            console.log(`Pull request #${pullRequestNumber} is ${isMergeable ? '' : 'not '}mergeable`);
            core.setOutput('IS_MERGEABLE', isMergeable);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
