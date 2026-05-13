import * as core from '@actions/core';
import {getDeployChecklist} from '@github/libs/DeployChecklistUtils';

const run = function (): Promise<void> {
    return getDeployChecklist()
        .then(({labels, number}) => {
            const labelsNames = labels.map((label) => {
                if (typeof label === 'string') {
                    return '';
                }
                return label.name;
            });
            console.log(`Found deploy checklist with labels: ${JSON.stringify(labelsNames)}`);
            core.setOutput('IS_LOCKED', labelsNames.includes('🔐 LockCashDeploys 🔐'));
            core.setOutput('NUMBER', number);
        })
        .catch((err) => {
            console.warn('No open deploy checklist found, continuing...', err);
            core.setOutput('IS_LOCKED', false);
            core.setOutput('NUMBER', 0);
        });
};

if (require.main === module) {
    run();
}

export default run;
