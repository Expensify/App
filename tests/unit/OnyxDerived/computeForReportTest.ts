import sortedReportActionsConfig, {computeForReport} from '@libs/actions/OnyxDerived/configs/sortedReportActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection} from 'react-native-onyx';

import {createMockReport} from '../../utils/ReportTestUtils';

function createAction(id: string, created: string, overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: id,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: 1,
        created,
        message: [{type: 'COMMENT', html: 'test', text: 'test'}],
        originalMessage: {html: 'test', lastModified: created},
        avatar: '',
        automatic: false,
        shouldShow: true,
        lastModified: created,
        person: [{type: 'TEXT', style: 'strong', text: 'User'}],
        ...overrides,
    } as ReportAction;
}

function toReportActions(...actions: ReportAction[]): ReportActions {
    const result: ReportActions = {};
    for (const action of actions) {
        result[action.reportActionID] = action;
    }
    return result;
}

describe('computeForReport', () => {
    const reportID = '1';
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;

    it('sorts actions in descending order (newest first)', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const action2 = createAction('2', '2024-01-02 10:00:00.000');
        const action3 = createAction('3', '2024-01-03 10:00:00.000');
        const actions = toReportActions(action1, action2, action3);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createMockReport({reportID})};

        const result = computeForReport(reportID, actions, allReportActions, allReports, false);

        expect(result.sortedReportActions.map((a) => a.reportActionID)).toEqual(['3', '2', '1']);
    });

    it('returns the newest action as lastAction', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const action2 = createAction('2', '2024-01-03 10:00:00.000');
        const action3 = createAction('3', '2024-01-02 10:00:00.000');
        const actions = toReportActions(action1, action2, action3);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createMockReport({reportID})};

        const result = computeForReport(reportID, actions, allReportActions, allReports, false);

        expect(result.lastAction?.reportActionID).toBe('2');
    });

    it('returns undefined lastAction for an empty actions object', () => {
        const actions: ReportActions = {};
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createMockReport({reportID})};

        const result = computeForReport(reportID, actions, allReportActions, allReports, false);

        expect(result.sortedReportActions).toEqual([]);
        expect(result.lastAction).toBeUndefined();
    });

    it('returns undefined transactionThreadReportID for a non-expense report', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const actions = toReportActions(action1);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createMockReport({reportID, type: CONST.REPORT.TYPE.CHAT})};

        const result = computeForReport(reportID, actions, allReportActions, allReports, false);

        expect(result.transactionThreadReportID).toBeUndefined();
    });

    it('merges transaction thread actions for a one-transaction expense report', () => {
        const transactionThreadReportID = '2';
        const transactionThreadActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`;

        const iouAction = createAction('100', '2024-01-01 10:00:00.000', {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            childReportID: transactionThreadReportID,
            reportID,
            originalMessage: {
                IOUTransactionID: 'txn1',
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: 'USD',
            },
        } as Partial<ReportAction>);

        const parentActions = toReportActions(iouAction);
        const threadAction200 = createAction('200', '2024-01-01 11:00:00.000');
        const threadAction201 = createAction('201', '2024-01-01 12:00:00.000');
        const threadActions = toReportActions(threadAction200, threadAction201);
        const chatReport = createMockReport({reportID: '3', type: CONST.REPORT.TYPE.CHAT});
        const expenseReport = createMockReport({reportID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: '3'});

        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: parentActions,
            [transactionThreadActionsKey]: threadActions,
        };
        const allReports: OnyxCollection<Report> = {
            [reportKey]: expenseReport,
            [`${ONYXKEYS.COLLECTION.REPORT}3`]: chatReport,
        };

        const result = computeForReport(reportID, parentActions, allReportActions, allReports, false);

        if (result.transactionThreadReportID) {
            expect(result.sortedReportActions.length).toBeGreaterThan(Object.keys(parentActions).length);

            const threadActionIDs = result.sortedReportActions.map((a) => a.reportActionID);
            expect(threadActionIDs).toContain('200');
            expect(threadActionIDs).toContain('201');
        }
    });

    it('handles single action correctly', () => {
        const action1 = createAction('1', '2024-06-15 08:30:00.000');
        const actions = toReportActions(action1);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createMockReport({reportID})};

        const result = computeForReport(reportID, actions, allReportActions, allReports, false);

        expect(result.sortedReportActions).toHaveLength(1);
        expect(result.sortedReportActions.at(0)?.reportActionID).toBe('1');
        expect(result.lastAction?.reportActionID).toBe('1');
    });

    it('handles undefined allReportActions gracefully for transaction thread merging', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const actions = toReportActions(action1);
        const expenseReport = createMockReport({reportID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: '3'});
        const chatReport = createMockReport({reportID: '3', type: CONST.REPORT.TYPE.CHAT});
        const allReports: OnyxCollection<Report> = {
            [reportKey]: expenseReport,
            [`${ONYXKEYS.COLLECTION.REPORT}3`]: chatReport,
        };

        const result = computeForReport(reportID, actions, undefined, allReports, false);

        expect(result.sortedReportActions).toHaveLength(1);
        expect(result.lastAction?.reportActionID).toBe('1');
    });

    it('handles undefined allReports gracefully', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const action2 = createAction('2', '2024-01-02 10:00:00.000');
        const actions = toReportActions(action1, action2);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};

        const result = computeForReport(reportID, actions, allReportActions, undefined, false);

        expect(result.sortedReportActions.map((a) => a.reportActionID)).toEqual(['2', '1']);
        expect(result.transactionThreadReportID).toBeUndefined();
    });

    describe('offline handling when a second IOU action is pending deletion', () => {
        const transactionThreadReportID = '2';
        const chatReportID = '3';

        // An expense report with one active expense plus a second expense the user deleted while offline.
        // Online, the deleted action is ignored, so the report is still a one-transaction report.
        // Offline, the deleted (pending-delete) action is still counted, so it is no longer a one-transaction report.
        function buildExpenseReportWithPendingDeletedExpense() {
            const activeIOUAction = createAction('100', '2024-01-01 10:00:00.000', {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: transactionThreadReportID,
                originalMessage: {
                    IOUTransactionID: 'txn1',
                    IOUReportID: reportID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                },
            } as Partial<ReportAction>);

            const pendingDeleteIOUAction = createAction('101', '2024-01-01 09:00:00.000', {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: '4',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                message: [{type: 'COMMENT', html: '', text: ''}],
                originalMessage: {
                    IOUTransactionID: 'txn2',
                    IOUReportID: reportID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 50,
                    currency: 'USD',
                },
            } as Partial<ReportAction>);

            const parentActions = toReportActions(activeIOUAction, pendingDeleteIOUAction);
            const threadActions = toReportActions(createAction('200', '2024-01-01 11:00:00.000'));
            const chatReport = createMockReport({reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT});
            const expenseReport = createMockReport({reportID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID});

            const allReportActions: OnyxCollection<ReportActions> = {
                [reportActionsKey]: parentActions,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`]: threadActions,
            };
            const allReports: OnyxCollection<Report> = {
                [reportKey]: expenseReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: chatReport,
            };

            return {parentActions, allReportActions, allReports};
        }

        it('counts the pending-delete action when offline, so it is not a one-transaction report', () => {
            const {parentActions, allReportActions, allReports} = buildExpenseReportWithPendingDeletedExpense();

            const result = computeForReport(reportID, parentActions, allReportActions, allReports, true);

            expect(result.transactionThreadReportID).toBeUndefined();
        });

        it('ignores the pending-delete action when online, so it is still a one-transaction report', () => {
            const {parentActions, allReportActions, allReports} = buildExpenseReportWithPendingDeletedExpense();

            const result = computeForReport(reportID, parentActions, allReportActions, allReports, false);

            expect(result.transactionThreadReportID).toBe(transactionThreadReportID);
        });
    });
});

describe('sortedReportActions', () => {
    const expenseReportID = '1';
    const transactionThreadReportID = '2';
    const chatReportID = '3';
    const unrelatedReportID = '4';
    const expenseActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`;
    const threadActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`;
    const unrelatedActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${unrelatedReportID}`;
    const iouAction = createAction('100', '2024-01-01 10:00:00.000', {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID: transactionThreadReportID,
        reportID: expenseReportID,
        originalMessage: {IOUTransactionID: 'txn1', type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
    });
    const allReports: OnyxCollection<Report> = {
        [`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`]: createMockReport({reportID: expenseReportID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID}),
        [`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: createMockReport({reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT}),
        [`${ONYXKEYS.COLLECTION.REPORT}${unrelatedReportID}`]: createMockReport({reportID: unrelatedReportID, type: CONST.REPORT.TYPE.CHAT}),
    };
    const initialReportActions: OnyxCollection<ReportActions> = {
        [expenseActionsKey]: toReportActions(iouAction),
        [threadActionsKey]: toReportActions(createAction('200', '2024-01-01 11:00:00.000')),
        [unrelatedActionsKey]: toReportActions(createAction('400', '2024-01-01 09:00:00.000')),
    };
    const currentValue: SortedReportActionsDerivedValue = sortedReportActionsConfig.compute([initialReportActions, allReports, undefined], {
        currentValue: undefined,
        sourceValues: undefined,
        triggeredKeys: new Set<OnyxKey>(),
    });

    it('recomputes only the reports linked to a changed chat report', () => {
        // Given the chat report of the expense report changed, and nothing else
        const changedReports = {[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: allReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]};

        // When only the report collection triggers a recompute
        const result = sortedReportActionsConfig.compute([initialReportActions, allReports, undefined], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: changedReports},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then the expense report is recomputed because its chat report changed, and the unrelated report keeps its sorted actions
        expect(result.sortedActions[expenseReportID]).not.toBe(currentValue.sortedActions[expenseReportID]);
        expect(result.sortedActions[expenseReportID]).toEqual(currentValue.sortedActions[expenseReportID]);
        expect(result.sortedActions[unrelatedReportID]).toBe(currentValue.sortedActions[unrelatedReportID]);
    });

    it('updates the last action of an expense report when its transaction thread gets a new action', () => {
        // Given a one-transaction expense report whose transaction thread gets a newer comment
        expect(currentValue.transactionThreadIDs[expenseReportID]).toBe(transactionThreadReportID);
        const newThreadAction = createAction('201', '2024-01-01 12:00:00.000');
        const threadActions = {...initialReportActions[threadActionsKey], [newThreadAction.reportActionID]: newThreadAction};
        const allReportActions = {...initialReportActions, [threadActionsKey]: threadActions};

        // When only the thread's actions trigger a recompute
        const result = sortedReportActionsConfig.compute([allReportActions, allReports, undefined], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {[threadActionsKey]: threadActions}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS]),
        });

        // Then the expense report shows the thread's newest comment as its last action
        expect(result.lastActions[expenseReportID]?.reportActionID).toBe(newThreadAction.reportActionID);
        expect(result.sortedActions[unrelatedReportID]).toBe(currentValue.sortedActions[unrelatedReportID]);
    });
});
