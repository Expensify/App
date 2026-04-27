import * as core from '@actions/core';
import type {components as OctokitComponents} from '@octokit/openapi-types/types';
import CONST from '@github/libs/CONST';
import {listOpenStagingDeployChecklistIssuesWithRetry} from '@github/libs/DeployChecklistUtils';

type OctokitIssueItem = OctokitComponents['schemas']['issue'];

function issueHasLockLabel(labels: OctokitIssueItem['labels']): boolean {
    if (!labels) {
        return false;
    }
    return labels.some((label) => typeof label !== 'string' && label.name === CONST.LABELS.LOCK_DEPLOY);
}

const run = async function (): Promise<void> {
    try {
        const issues = await listOpenStagingDeployChecklistIssuesWithRetry();

        if (issues.length === 0) {
            console.log(`Successful GitHub response: no open ${CONST.LABELS.STAGING_DEPLOY} issue; treating as not locked.`);
            core.setOutput('IS_LOCKED', false);
            core.setOutput('NUMBER', 0);
            core.setOutput('CHECKLIST_STATE', 'absent');
            return;
        }

        if (issues.length > 1) {
            console.error(`Found ${issues.length} open ${CONST.LABELS.STAGING_DEPLOY} issues; blocking deploy until only one exists.`);
            core.setOutput('IS_LOCKED', true);
            core.setOutput('NUMBER', 0);
            core.setOutput('CHECKLIST_STATE', 'ambiguous');
            return;
        }

        const issue = issues.at(0);
        if (!issue) {
            console.error(`Expected exactly one ${CONST.LABELS.STAGING_DEPLOY} issue but got empty element.`);
            core.setOutput('IS_LOCKED', true);
            core.setOutput('NUMBER', 0);
            core.setOutput('CHECKLIST_STATE', 'unknown');
            return;
        }
        const labelsNames = (issue.labels ?? []).map((label) => {
            if (typeof label === 'string') {
                return '';
            }
            return label.name;
        });
        const locked = issueHasLockLabel(issue.labels);
        console.log(`Found deploy checklist #${issue.number} with labels: ${JSON.stringify(labelsNames)}`);
        core.setOutput('IS_LOCKED', locked);
        core.setOutput('NUMBER', issue.number);
        core.setOutput('CHECKLIST_STATE', locked ? 'locked' : 'unlocked');
    } catch (error) {
        console.error('Failed to resolve deploy checklist after retries; blocking deploy.', error);
        core.setOutput('IS_LOCKED', true);
        core.setOutput('NUMBER', 0);
        core.setOutput('CHECKLIST_STATE', 'unknown');
    }
};

if (require.main === module) {
    run();
}

export default run;
