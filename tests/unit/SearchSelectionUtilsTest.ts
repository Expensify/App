import getSearchMoveSelectionValidation from '@components/Search/SearchSelectionUtils';
import type {SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

const SUBMITTER_LOGIN = 'submitter@test.com';
const FIRST_APPROVER_LOGIN = 'first.approver@test.com';
const FORWARDED_APPROVER_LOGIN = 'forwarded.approver@test.com';
const NEW_APPROVER_LOGIN = 'new.approver@test.com';
const OLD_APPROVER_LOGIN = 'old.approver@test.com';

function createSelectedTransaction(overrides: Partial<SelectedTransactionInfo> = {}): SelectedTransactionInfo {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: true,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID: 'report-1',
        policyID: 'policy-1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        transaction: {
            transactionID: 'tx-1',
        } as SelectedTransactionInfo['transaction'],
        ...overrides,
    };
}

function createProcessingExpenseReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: 'report-1',
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        ownerAccountID: 1,
        managerID: 2,
        policyID: 'policy-1',
        submitted: '2026-04-03 10:00:00',
        nextStep: {
            actorAccountID: 2,
            messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
            icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        },
        ...overrides,
    } as Report;
}

function createPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: 'policy-1',
        name: 'Workspace',
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: 'owner@test.com',
        approver: FIRST_APPROVER_LOGIN,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        employeeList: {
            [SUBMITTER_LOGIN]: {
                email: SUBMITTER_LOGIN,
                submitsTo: FIRST_APPROVER_LOGIN,
                role: CONST.POLICY.ROLE.USER,
            },
            [FIRST_APPROVER_LOGIN]: {
                email: FIRST_APPROVER_LOGIN,
                forwardsTo: FORWARDED_APPROVER_LOGIN,
                role: CONST.POLICY.ROLE.ADMIN,
            },
            [FORWARDED_APPROVER_LOGIN]: {
                email: FORWARDED_APPROVER_LOGIN,
                role: CONST.POLICY.ROLE.USER,
            },
        },
        ...overrides,
    } as Policy;
}

function getLoginForAccountID(accountID: number): string | undefined {
    switch (accountID) {
        case 1:
            return SUBMITTER_LOGIN;
        case 2:
            return FIRST_APPROVER_LOGIN;
        case 3:
            return FORWARDED_APPROVER_LOGIN;
        default:
            return undefined;
    }
}

describe('getSearchMoveSelectionValidation', () => {
    it('allows a same-owner movable selection', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: true,
                canMoveToReport: true,
                hasMultipleOwners: false,
                hasOnlyTransactionSelections: true,
                hasSelections: true,
                targetOwnerAccountID: 1,
            }),
        );
    });

    it('blocks empty selections', () => {
        expect(getSearchMoveSelectionValidation({})).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: false,
                canMoveToReport: false,
                hasSelections: false,
            }),
        );
    });

    it('blocks report-level selections without transaction data', () => {
        const selectedTransactions: SelectedTransactions = {
            report1: createSelectedTransaction({
                transaction: undefined,
                canChangeReport: false,
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual(
            expect.objectContaining({
                canMoveToReport: false,
                hasOnlyTransactionSelections: false,
            }),
        );
    });

    it('blocks mixed-owner selections', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 2,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual(
            expect.objectContaining({
                canMoveToReport: false,
                hasMultipleOwners: true,
                targetOwnerAccountID: undefined,
            }),
        );
    });

    it('blocks selections when any transaction cannot move', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
                canChangeReport: false,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: false,
                canMoveToReport: false,
            }),
        );
    });

    it('uses the report-owner fallback when owner metadata is not attached to the selection', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: undefined,
                report: undefined,
                reportID: 'report-1',
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getOwnerAccountIDForReportID: (reportID) => (reportID === 'report-1' ? 42 : undefined),
            }),
        ).toEqual(
            expect.objectContaining({
                canMoveToReport: true,
                targetOwnerAccountID: 42,
            }),
        );
    });

    it('blocks the move action in expense-report search even when the selection is otherwise valid', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                isExpenseReportSearch: true,
            }),
        ).toEqual(
            expect.objectContaining({
                canMoveToReport: false,
            }),
        );
    });

    it('blocks forwarded-like search selections when the snapshot shows waitingToApprove and the submit-to approver forwards to the current manager', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                ownerAccountID: 1,
                report: createProcessingExpenseReport({
                    ownerAccountID: 1,
                    managerID: 3,
                    nextStep: {
                        actorAccountID: 3,
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    },
                }),
                policyID: 'policy-1',
                canChangeReport: true,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getPolicyForPolicyID: () => createPolicy(),
                resolveSubmitToAccountID: () => 2,
                getLoginForAccountID,
            }),
        ).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: false,
                canMoveToReport: false,
            }),
        );
    });

    it('keeps move enabled for normal submitted reports when submit-to and manager match', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                ownerAccountID: 1,
                report: createProcessingExpenseReport({
                    ownerAccountID: 1,
                    managerID: 2,
                }),
                policyID: 'policy-1',
                canChangeReport: true,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getPolicyForPolicyID: () => createPolicy(),
                resolveSubmitToAccountID: () => 2,
                getLoginForAccountID,
            }),
        ).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: true,
                canMoveToReport: true,
            }),
        );
    });

    it('falls back to the existing canChangeReport result when search policy context is unavailable', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                ownerAccountID: 1,
                report: createProcessingExpenseReport({
                    ownerAccountID: 1,
                    managerID: 3,
                    nextStep: {
                        actorAccountID: 3,
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    },
                }),
                policyID: 'policy-1',
                canChangeReport: true,
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: true,
                canMoveToReport: true,
            }),
        );
    });

    it('keeps move enabled when submit-to differs from manager but the policy does not forward to that manager', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                ownerAccountID: 1,
                report: createProcessingExpenseReport({
                    ownerAccountID: 1,
                    managerID: 3,
                    nextStep: {
                        actorAccountID: 3,
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    },
                }),
                policyID: 'policy-1',
                canChangeReport: true,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getPolicyForPolicyID: () =>
                    createPolicy({
                        employeeList: {
                            [SUBMITTER_LOGIN]: {
                                email: SUBMITTER_LOGIN,
                                submitsTo: FIRST_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.USER,
                            },
                            [FIRST_APPROVER_LOGIN]: {
                                email: FIRST_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.ADMIN,
                            },
                            [FORWARDED_APPROVER_LOGIN]: {
                                email: FORWARDED_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.USER,
                            },
                        },
                    }),
                resolveSubmitToAccountID: () => 2,
                getLoginForAccountID,
            }),
        ).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: true,
                canMoveToReport: true,
            }),
        );
    });

    it('keeps move enabled for policy-mutation mismatch cases when the next step points to the new approver instead of the stale manager', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                ownerAccountID: 1,
                report: createProcessingExpenseReport({
                    ownerAccountID: 1,
                    managerID: 3,
                    nextStep: {
                        actorAccountID: 2,
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    },
                }),
                policyID: 'policy-1',
                canChangeReport: true,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getPolicyForPolicyID: () =>
                    createPolicy({
                        employeeList: {
                            [SUBMITTER_LOGIN]: {
                                email: SUBMITTER_LOGIN,
                                submitsTo: NEW_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.USER,
                            },
                            [NEW_APPROVER_LOGIN]: {
                                email: NEW_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.ADMIN,
                            },
                            [OLD_APPROVER_LOGIN]: {
                                email: OLD_APPROVER_LOGIN,
                                role: CONST.POLICY.ROLE.USER,
                            },
                        },
                    }),
                resolveSubmitToAccountID: () => 2,
                getLoginForAccountID: (accountID) => {
                    switch (accountID) {
                        case 1:
                            return SUBMITTER_LOGIN;
                        case 2:
                            return NEW_APPROVER_LOGIN;
                        case 3:
                            return OLD_APPROVER_LOGIN;
                        default:
                            return undefined;
                    }
                },
            }),
        ).toEqual(
            expect.objectContaining({
                canAllTransactionsBeMoved: true,
                canMoveToReport: true,
            }),
        );
    });
});
