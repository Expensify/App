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
        // Given no report actions are available
        const reportActions = undefined;

        // When the selector runs
        const result = currentCycleForwardedActorAccountIDsSelector(reportActions);

        // Then it returns undefined so callers can distinguish "not loaded" from "no forwards"
        expect(result).toBeUndefined();
    });

    it('returns an empty array when the report has no SUBMITTED/FORWARDED actions in the current cycle', () => {
        // Given a report whose only action is an APPROVED entry
        const reportActions: ReportActions = buildReportActions([buildApprovedAction(1, APPROVER_A_ACCOUNT_ID, '2025-01-01T00:00:00Z')]);

        // When the selector runs
        const result = currentCycleForwardedActorAccountIDsSelector(reportActions);

        // Then the forwarder list is empty
        expect(result).toEqual([]);
    });

    it('collects forwarders newest-first and stops at the latest SUBMITTED', () => {
        // Given an older cycle (submit → forward A) followed by the current cycle (submit → forward A → forward B)
        const reportActions: ReportActions = buildReportActions([
            buildSubmitAction(1, SUBMITTER_ACCOUNT_ID, '2025-01-01T00:00:00Z'),
            buildForwardAction(2, APPROVER_A_ACCOUNT_ID, '2025-01-02T00:00:00Z'),
            buildSubmitAction(3, SUBMITTER_ACCOUNT_ID, '2025-02-01T00:00:00Z'),
            buildForwardAction(4, APPROVER_A_ACCOUNT_ID, '2025-02-02T00:00:00Z'),
            buildForwardAction(5, APPROVER_B_ACCOUNT_ID, '2025-02-03T00:00:00Z'),
        ]);

        // When the selector runs
        const result = currentCycleForwardedActorAccountIDsSelector(reportActions);

        // Then only the current cycle's forwarders are returned, newest-first
        expect(result).toEqual([APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID]);
    });

    it('deduplicates the same forwarder across the current cycle', () => {
        // Given approver A forwards twice in the same cycle, with approver B in between
        const reportActions: ReportActions = buildReportActions([
            buildSubmitAction(1, SUBMITTER_ACCOUNT_ID, '2025-02-01T00:00:00Z'),
            buildForwardAction(2, APPROVER_A_ACCOUNT_ID, '2025-02-02T00:00:00Z'),
            buildForwardAction(3, APPROVER_B_ACCOUNT_ID, '2025-02-03T00:00:00Z'),
            buildForwardAction(4, APPROVER_A_ACCOUNT_ID, '2025-02-04T00:00:00Z'),
        ]);

        // When the selector runs
        const result = currentCycleForwardedActorAccountIDsSelector(reportActions);

        // Then each account appears once, at its most recent position
        expect(result).toEqual([APPROVER_A_ACCOUNT_ID, APPROVER_B_ACCOUNT_ID]);
    });
});

describe('submitterAndLastForwardedActorEmailSelector', () => {
    it('returns the newest forwarder who is still a workspace member', () => {
        // Given a workspace where every forwarder is still a member
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, APPROVER_B_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the emails
        const result = selector(PERSONAL_DETAILS);

        // Then the submitter and the newest forwarder are returned
        expect(result).toEqual({submitterEmail: SUBMITTER_EMAIL, lastForwardedActorEmail: APPROVER_B_EMAIL});
    });

    it('skips a removed workspace member and walks back to the next eligible approver', () => {
        // Given approver B has been removed from the workspace while approver A is still a member
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then B is skipped and A is offered as the previous approver
        expect(result.lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('skips an approver whose removal is optimistically pending (pendingAction DELETE)', () => {
        // Given approver B is still listed but has been marked for optimistic removal
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, APPROVER_B_EMAIL]);
        if (policy.employeeList?.[APPROVER_B_EMAIL]) {
            policy.employeeList[APPROVER_B_EMAIL].pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        }
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then the pending-delete approver is skipped and A is offered instead
        expect(result.lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('returns no last approver when every forwarder has left the workspace', () => {
        // Given no forwarder is still a workspace member
        const policy = buildPolicy([SUBMITTER_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then no previous approver is offered, so the picker falls back to the submitter only
        expect(result.lastForwardedActorEmail).toBeUndefined();
    });

    it('skips the current user and the submitter when picking the last approver', () => {
        // Given the newest forward is by the current user and the next by the submitter, with A as the earlier approver
        const policy = buildPolicy([SUBMITTER_EMAIL, APPROVER_A_EMAIL, CURRENT_USER_EMAIL]);
        const selector = submitterAndLastForwardedActorEmailSelector(
            SUBMITTER_ACCOUNT_ID,
            [CURRENT_USER_ACCOUNT_ID, SUBMITTER_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID],
            CURRENT_USER_ACCOUNT_ID,
            policy,
        );

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then the current user and submitter are skipped and A is offered as the previous approver
        expect(result.lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });

    it('fails closed and offers no last approver when the policy employeeList is missing (hydration race)', () => {
        // Given the policy's employeeList has not loaded yet
        const policy = buildPolicy([]);
        policy.employeeList = undefined;
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_B_ACCOUNT_ID, APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then no previous approver is offered, matching Auth's server-side strictness instead of exposing an ex-member target
        expect(result.lastForwardedActorEmail).toBeUndefined();
    });

    it('keeps the policy owner eligible even when they are not in employeeList', () => {
        // Given approver A owns the workspace but is not listed in employeeList
        const policy = buildPolicy([SUBMITTER_EMAIL]);
        policy.owner = APPROVER_A_EMAIL;
        const selector = submitterAndLastForwardedActorEmailSelector(SUBMITTER_ACCOUNT_ID, [APPROVER_A_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, policy);

        // When the selector resolves the last forwarded actor
        const result = selector(PERSONAL_DETAILS);

        // Then the owner is still offered as the previous approver
        expect(result.lastForwardedActorEmail).toBe(APPROVER_A_EMAIL);
    });
});
