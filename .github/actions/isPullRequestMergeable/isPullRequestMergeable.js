const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../libs/GithubUtils');
const promiseWhile = require('../../libs/promiseWhile');

const MAX_RETRIES = 30;
const THROTTLE_DURATION = process.env.NODE_ENV === 'test' ? 5 : 5000;

const run = function () {
    const pullRequestNumber = Number(core.getInput('PULL_REQUEST_NUMBER', {required: true}));

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
                if (_.isNull(data.mergeable)) {
                    console.log('Pull request mergeability is not yet resolved...');
                    retryCount++;
                    return;
                }

                mergeabilityResolved = true;
                isMergeable = data.mergeable;
            })
            .catch((githubError) => {
                mergeabilityResolved = true;
                console.error(`An error occurred fetching the PR from Github: ${JSON.stringify(githubError)}`);
                core.setFailed(githubError);
            }), THROTTLE_DURATION),
    )
        .then(() => {
            if (retryCount >= MAX_RETRIES) {
                console.error('Maximum retries reached, mergeability is undetermined, defaulting to false');
            } else {
                console.log(`Pull request #${pullRequestNumber} is ${isMergeable ? '' : 'not '}mergeable`);
            }
            core.setOutput('IS_MERGEABLE', isMergeable);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
