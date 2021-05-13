const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../libs/GithubUtils');

const run = function () {
    return GithubUtils.getStagingDeployCash()
        .then(({labels}) => {
            console.log(`Found StagingDeployCash with labels: ${_.pluck(labels, 'name')}`);
            core.setOutput('IS_LOCKED', _.contains(_.pluck(labels, 'name'), '🔐 LockCashDeploys 🔐'));
        })
        .catch((err) => {
            console.warn('No open StagingDeployCash found, continuing...', err);
            core.setOutput('IS_LOCKED', false);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
