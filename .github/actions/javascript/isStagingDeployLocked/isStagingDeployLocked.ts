import * as core from '@actions/core';
import GithubUtils from '@github/libs/GithubUtils';

const run = function (): Promise<void> {
    return GithubUtils.getStagingDeployCash()
        .then(({labels, number}) => {
            const labelsNames = labels.map((label) => {
                if (typeof label === 'string') {
                    return '';
                }
                return label.name;
            });
            console.log(`Found StagingDeployCash with labels: ${JSON.stringify(labelsNames)}`);
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
