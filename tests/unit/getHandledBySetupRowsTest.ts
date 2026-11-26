import getHandledBySetupRows, {HANDLED_BY_SETUP_ROW} from '@pages/Insights/charts/getHandledBySetupRows';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const ADMIN_LOGIN = 'admin@company.com';
const AGENT_LOGIN = 'approver_12345@expensify.ai';

/** A workspace the test admin manages, with the given members and settings. */
function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1),
        id: 'A1',
        role: CONST.POLICY.ROLE.ADMIN,
        employeeList: {[ADMIN_LOGIN]: {email: ADMIN_LOGIN, role: CONST.POLICY.ROLE.ADMIN}},
        autoReporting: false,
        shouldShowAutoApprovalOptions: false,
        autoApproval: undefined,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        errorFields: undefined,
        ...overrides,
    };
}

describe('getHandledBySetupRows', () => {
    it('offers an agent and the rule to an admin of the one picked workspace without either', () => {
        // Given an admin who picked one workspace with no agent member and auto-approval off
        const policy = buildPolicy();

        // When the setup rows are worked out for the approve stage
        const rows = getHandledBySetupRows({policyIDs: ['A1'], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});

        // Then both setup rows are offered, the rule first, as the design lists them
        expect(rows).toEqual([HANDLED_BY_SETUP_ROW.RULE, HANDLED_BY_SETUP_ROW.AGENT]);
    });

    it('offers nothing when no single workspace is picked or the user is not its admin', () => {
        // Given a workspace without an agent or rules, and a member who doesn't admin it
        const policy = buildPolicy();
        const memberPolicy = buildPolicy({role: CONST.POLICY.ROLE.USER});

        // When the setup rows are worked out for every workspace, two workspaces, and a member
        const allWorkspaces = getHandledBySetupRows({policyIDs: [], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});
        const twoWorkspaces = getHandledBySetupRows({policyIDs: ['A1', 'B2'], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});
        const member = getHandledBySetupRows({policyIDs: ['A1'], policy: memberPolicy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});

        // Then none are offered, since setting up an agent or a rule changes one workspace and needs an admin
        expect(allWorkspaces).toEqual([]);
        expect(twoWorkspaces).toEqual([]);
        expect(member).toEqual([]);
    });

    it('drops the agent row once an agent is a member of the workspace', () => {
        // Given a workspace whose members include an AI agent
        const policy = buildPolicy({
            employeeList: {
                [ADMIN_LOGIN]: {email: ADMIN_LOGIN, role: CONST.POLICY.ROLE.ADMIN},
                [AGENT_LOGIN]: {email: AGENT_LOGIN, role: CONST.POLICY.ROLE.USER},
            },
        });

        // When the setup rows are worked out
        const rows = getHandledBySetupRows({policyIDs: ['A1'], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});

        // Then only the rule is offered, since the agent can already handle reports
        expect(rows).toEqual([HANDLED_BY_SETUP_ROW.RULE]);
    });

    it("checks the stage's own rule: auto-approval to approve, Submissions to submit", () => {
        // Given a workspace with auto-approval on but Submissions off
        const policy = buildPolicy({shouldShowAutoApprovalOptions: true});

        // When the setup rows are worked out for each stage
        const approve = getHandledBySetupRows({policyIDs: ['A1'], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE});
        const submit = getHandledBySetupRows({policyIDs: ['A1'], policy, login: ADMIN_LOGIN, stage: CONST.INSIGHTS.HANDLED_BY_STAGE.SUBMIT});

        // Then the rule row only shows for the stage whose setting is off
        expect(approve).toEqual([HANDLED_BY_SETUP_ROW.AGENT]);
        expect(submit).toEqual([HANDLED_BY_SETUP_ROW.RULE, HANDLED_BY_SETUP_ROW.AGENT]);
    });
});
