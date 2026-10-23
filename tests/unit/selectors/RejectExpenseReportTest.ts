import CONST from '@src/CONST';
import {currentCycleForwardedActorAccountIDsSelector, submitterAndLastForwardedActorEmailSelector} from '@src/selectors/RejectExpenseReport';
import type {PersonalDetailsList, Policy, ReportAction, ReportActions} from '@src/types/onyx';

import createRandomReportAction from '../../utils/collections/reportActions';

const SUBMITTER_ACCOUNT_ID = 1;
const APPROVER_A_ACCOUNT_ID = 2;
const APPROVER_B_ACCOUNT_ID = 3;
const CURRENT_USER_ACCOUNT_ID = 4;

const SUBMITTER_EMAIL = 'submitter@test.com';
const APPROVER_A_EMAIL = 'approver.a@test.com';
const APPROVER_B_EMAIL = 'approver.b@test.com';
const CURRENT_USER_EMAIL = 'current.user@test.com';

const PERSONAL_DETAILS: PersonalDetailsList = Object.fromEntries([
    [SUBMITTER_ACCOUNT_ID, {accountID: SUBMITTER_ACCOUNT_ID, login: SUBMITTER_EMAIL}],
    [APPROVER_A_ACCOUNT_ID, {accountID: APPROVER_A_ACCOUNT_ID, login: APPROVER_A_EMAIL}],
    [APPROVER_B_ACCOUNT_ID, {accountID: APPROVER_B_ACCOUNT_ID, login: APPROVER_B_EMAIL}],
    [CURRENT_USER_ACCOUNT_ID, {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL}],
]);

function buildSubmitAction(index: number, actorAccountID: number, created: string): ReportAction {
    return {
        ...createRandomReportAction(index),
        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
        actorAccountID,
        created,
    };
}

function buildForwardAction(index: number, actorAccountID: number, created: string): ReportAction {
    return {
        ...createRandomReportAction(index),
        actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
        actorAccountID,
        created,
    };
}

function buildApprovedAction(index: number, actorAccountID: number, created: string): ReportAction {
    return {
        ...createRandomReportAction(index),
        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
        actorAccountID,
        created,
    };
}

function buildReportActions(actions: ReportAction[]): ReportActions {
    return Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
}

function buildPolicy(employeeEmails: string[]): Policy {
    const policy: Policy = {
        id: 'FAKE_POLICY',
        name: 'Fake Policy',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: SUBMITTER_EMAIL,
        outputCurrency: CONST.CURRENCY.USD,
        employeeList: Object.fromEntries(employeeEmails.map((email) => [email, {email, role: CONST.POLICY.ROLE.USER}])),
    };
    return policy;
}

describe('currentCycleForwardedActorAccountIDsSelector', () => {
    it('returns undefined when reportActions is nullish', () => {
        expect(currentCycleForwardedActorAccountIDsSelector(undefined)).toBeUndefined();
    });

    it('returns an empty array when the report has no SUBMITTED/FORWARDED actions in the current cycle', () => {
        const reportActions: ReportActions = buildReportActions([buildApprovedAction(1, APPROVER_A_ACCOUNT_ID, '2025-01-01T00:00:00Z')]);
        expect(currentCycleForwardedActorAccountIDsSelector(reportActions)).toEqual([]);
    });

    it('collects forwarders newest-first and stops at the latest SUBMITTED', () => {
        // Older cycle (ignored): submit → forward A
        // Current cycle: submit → forward A → forward B
        const reportActions: ReportActions = buildReportActions([
            buildSubmitAction(1, SUBMITTER_ACCOUNT_ID, '2025-01-01T00:00:00Z'),
            buildForwardAction(2, APPROVER_A_ACCOUNT_ID, '2025-01-02T00:00:00Z'),
            buildSubmitAction(3, SUBMITTER_ACCOUNT_ID, '2025-02-01T00:00:00Z'),
            buildForwardAction(4, APPROVER_A_ACCOUNT_ID, '2025-02-02T00:00:00Z'),
            buildForwardAction(5, APPROVER_B_ACCOUNT_ID, '2025-02-03T00:00:00Z'),
        ]);
        expect(currentCycleForwardedActorAccountIDsSelector(reportActions)).toEqual([APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID]);
    });

    it('deduplicates the same forwarder across the current cycle', () => {
        const reportActions: ReportActions = buildReportActions([
            buildSubmitAction(1, SUBMITTER_ACCOUNT_ID, '2025-02-01T00:00:00Z'),
            buildForwardAction(2, APPROVER_A_ACCOUNT_ID, '2025-02-02T00:00:00Z'),
            buildForwardAction(3, APPROVER_B_ACCOUNT_ID, '2025-02-03T00:00:00Z'),
            buildForwardAction(4, APPROVER_A_ACCOUNT_ID, '2025-02-04T00:00:00Z'),
        ]);
        expect(currentCycleForwardedActorAccountIDsSelector(reportActions)).toEqual([APPROVER_A_ACCOUNT_ID, APPROVER_B_ACCOUNT_ID]);
    });
});

describe('submitterAndLastForwardedActorEmailSelector', () => {
    it('returns the newest forwarder who is still a workspace member', () => {
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, APPROVER_B_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS)).toEqual({submitterEmail: SUBMITTER_EMAIL, lastForwardedActorEmail: APPROVER_B_EMAIL});
    });

    it('skips a removed workspace member and walks back to the next eligible approver', () => {
        // Approver B has left the workspace. The newest forward is B's, so the walk falls through to A.
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('skips an approver whose removal is optimistically pending (pendingAction DELETE)', () => {
        // Approver B is still listed but has been marked for optimistic removal — reject must not target them.
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, APPROVER_B_EMAIL]);
        if (policy.employeeList?.[APPROVER_B_EMAIL]) {
            policy.employeeList[APPROVER_B_EMAIL].pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        }
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('returns no last approver when every forwarder has left the workspace', () => {
        const policy = buildPolicy([SUBMITTER_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBeUndefined();
    });

    it('skips the current user and the submitter when picking the last approver', () => {
        // Newest forward is by the current user, next by the submitter — both must be skipped.
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, CURRENT_USER_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(
            SUBMITTER_ACCOUNT_ID,
            [CURRENT_USER_ACCOUNT_ID, SUBMITTER_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID],
            CURRENT_USER_ACCOUNT_ID,
            policy,
        );
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('fails closed and offers no last approver when the policy employeeList is missing (hydration race)', () => {
        // Pre-fix behaviour was to fall through and offer the newest forward anyway, which exposed the ex-member target bug.
        const policy = buildPolicy([]);
        policy.employeeList = undefined;
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBeUndefined();
    });

    it('keeps the policy owner eligible even when they are not in employeeList', () => {
        // Owner acts as approver A and the workspace has only the submitter in employeeList.
        const policy = buildPolicy([SUBMITTER_EMAIL]);
        policy.owner = APPROVER_A_EMAIL;
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);
        expect(selector(PERSONAL_DETAILS).lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });
});
