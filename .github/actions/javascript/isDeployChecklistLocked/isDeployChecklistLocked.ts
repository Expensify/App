import CONST from '@github/libs/CONST';
import {getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';

import * as core from '@actions/core';

const run = function (): Promise<void> {
    return getDeployChecklist()
        .then(({labels, number}) => {
            const labelNames = (labels ?? []).map((label) => (typeof label === 'string' ? label : (label.name ?? '')));
            const isLocked = labelNames.includes(CONST.LABELS.LOCK_DEPLOY);
            console.log(`Found deploy checklist #${number} with labels: ${JSON.stringify(labelNames)}`);
            core.setOutput('IS_LOCKED', isLocked);
            core.setOutput('NUMBER', number);
        })
        .catch((error: unknown) => {
            if (error instanceof NoOpenDeployChecklistError) {
                console.log(`No open deploy checklist; treating as not locked. ${error.message}`);
                core.setOutput('IS_LOCKED', false);
                core.setOutput('NUMBER', 0);
                return;
            }
            const message = error instanceof Error ? error.message : String(error);
            core.setFailed(`Could not resolve deploy checklist; blocking deploy: ${message}`);
        });
};

if (require.main === module) {
    run();
}

export default run;
