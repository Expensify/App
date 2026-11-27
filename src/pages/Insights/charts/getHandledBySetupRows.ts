/** Works out which setup rows the Handled by table offers a workspace admin: creating the stage's rule, and adding an AI agent. */
import {isAutoApproveCompliantReportsEnabled, isPolicyAdmin} from '@libs/PolicyUtils';
import {isAgentEmail} from '@libs/SessionUtils';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const HANDLED_BY_SETUP_ROW = {
    AGENT: 'agent',
    RULE: 'rule',
} as const;

type HandledBySetupRow = (typeof HANDLED_BY_SETUP_ROW)[keyof typeof HANDLED_BY_SETUP_ROW];

type GetHandledBySetupRowsParams = {
    /** The workspaces the page's Workspace filter picked */
    policyIDs: string[];

    /** The picked workspace, when exactly one is picked */
    policy: OnyxEntry<Policy>;

    login: string | undefined;

    stage: InsightsHandledByStage;
};

/** Whether the stage's rule is on: auto-approval for the approve stage, scheduled submissions for the submit stage */
function isStageRuleEnabled(policy: Policy, stage: InsightsHandledByStage): boolean {
    return stage === CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE ? isAutoApproveCompliantReportsEnabled(policy) : !!policy.autoReporting;
}

/**
 * Returns the setup rows to list under the table. They only show for one picked workspace the user admins, since setting up an agent or a rule is a per-workspace change.
 * Only agents that are members can approve or submit reports, so the agent row checks the member list rather than every agent the workspace owns.
 */
function getHandledBySetupRows({policyIDs, policy, login, stage}: GetHandledBySetupRowsParams): HandledBySetupRow[] {
    if (policyIDs.length !== 1 || !policy || policy.id !== policyIDs.at(0) || !isPolicyAdmin(policy, login)) {
        return [];
    }

    const rows: HandledBySetupRow[] = [];
    if (!isStageRuleEnabled(policy, stage)) {
        rows.push(HANDLED_BY_SETUP_ROW.RULE);
    }
    const hasAgent = Object.keys(policy.employeeList ?? {}).some((memberLogin) => isAgentEmail(memberLogin));
    if (!hasAgent) {
        rows.push(HANDLED_BY_SETUP_ROW.AGENT);
    }
    return rows;
}

export default getHandledBySetupRows;
export {HANDLED_BY_SETUP_ROW};
export type {HandledBySetupRow};
