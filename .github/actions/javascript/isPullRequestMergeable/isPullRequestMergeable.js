const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../../libs/GithubUtils');
const {promiseWhile} = require('../../../libs/promiseWhile');

const MAX_RETRIES = 30;
const THROTTLE_DURATION = process.env.NODE_ENV === 'test' ? 5 : 5000;

const run = function () {
    const pullRequestNumber = Number(core.getInput('PULL_REQUEST_NUMBER', {required: true}));

    let retryCount = 0;
    let isMergeable = false;
    let mergeabilityResolved = false;
    console.log(`Checking the mergeability of PR #${pullRequestNumber}`);
    return GithubUtils.octokit.pulls.get({
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.APP_REPO,
        pull_number: pullRequestNumber,
    })
        .then(({data}) => data.head.sha)
        .then(headRef => promiseWhile(
            () => !mergeabilityResolved && retryCount < MAX_RETRIES,
            _.throttle(
                () => Promise.all([
                    GithubUtils.octokit.pulls.get({
                        owner: GithubUtils.GITHUB_OWNER,
                        repo: GithubUtils.APP_REPO,
                        pull_number: pullRequestNumber,
                    }),
                    GithubUtils.octokit.checks.listForRef({
                        owner: GithubUtils.GITHUB_OWNER,
                        repo: GithubUtils.APP_REPO,
                        ref: headRef,
                    }),
                ])
                    .then(([prResponse, checksResponse]) => {
                        const mergeable = prResponse.data.mergeable;
                        const mergeableState = prResponse.data.mergeable_state;
                        const areChecksComplete = _.every(checksResponse.data.check_runs, check => check.status === 'completed');

                        if (_.isNull(mergeable)) {
                            console.log('Pull request mergeability is not yet resolved...');
                            retryCount++;
                            return;
                        }

                        if (_.isEmpty(mergeableState)) {
                            console.log('Pull request mergeable_state is not yet resolved...');
                            retryCount++;
                            return;
                        }

                        if (!areChecksComplete) {
                            console.log('Pull request checks are not yet complete...');
                            retryCount++;
                            return;
                        }

                        mergeabilityResolved = true;
                        console.log(`Merge information for #${pullRequestNumber} - mergeable: ${mergeable}, mergeable_state: ${mergeableState}`);
                        isMergeable = mergeable && mergeableState !== 'blocked';
                    })
                    .catch((githubError) => {
                        mergeabilityResolved = true;
                        console.error(`An error occurred fetching the PR from Github: ${JSON.stringify(githubError)}`);
                        core.setFailed(githubError);
                    }),
                THROTTLE_DURATION,
            ),
        ))
        .then(() => {
            if (retryCount >= MAX_RETRIES) {
                console.error('Maximum retries reached, mergeability is undetermined, defaulting to false');
            } else {
                console.log(`Pull request #${pullRequestNumber} is ${isMergeable ? '' : 'not '}mergeable`);
            }
            core.setOutput('IS_MERGEABLE', isMergeable);
        })
        .catch((githubError) => {
            mergeabilityResolved = true;
            console.error(`An error occurred fetching the PR from Github: ${JSON.stringify(githubError)}`);
            core.setFailed(githubError);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
