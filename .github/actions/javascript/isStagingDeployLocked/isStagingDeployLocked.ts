import * as core from '@actions/core';
import GithubUtils from '../../../libs/GithubUtils';

const run = function () {
    return GithubUtils.getStagingDeployCash()
        .then(({labels, number}) => {
            // @ts-expect-error TODO: Remove this once GithubUtils (https://github.com/Expensify/App/issues/25382) is migrated to TypeScript.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const labelsNames = labels.map((label) => label.name);
            console.log(`Found StagingDeployCash with labels: ${labelsNames}`);
            core.setOutput('IS_LOCKED', labelsNames.includes('🔐 LockCashDeploys 🔐'));
            core.setOutput('NUMBER', number);
        })
        .catch((err) => {
            console.warn('No open StagingDeployCash found, continuing...', err);
            core.setOutput('IS_LOCKED', false);
            core.setOutput('NUMBER', 0);
        });
};

if (require.main === module) {
    run();
}

export default run;
