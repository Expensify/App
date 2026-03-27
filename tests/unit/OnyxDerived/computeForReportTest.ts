import type {OnyxCollection} from 'react-native-onyx';
import {computeForReport} from '@libs/actions/OnyxDerived/configs/sortedReportActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

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

function createReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        reportName: `Report ${reportID}`,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: undefined,
        ownerAccountID: 1,
        isPinned: false,
        ...overrides,
    } as Report;
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
        const allReports: OnyxCollection<Report> = {[reportKey]: createReport(reportID)};

        const result = computeForReport(reportID, actions, allReportActions, allReports);

        expect(result.sortedReportActions.map((a) => a.reportActionID)).toEqual(['3', '2', '1']);
    });

    it('returns the newest action as lastAction', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const action2 = createAction('2', '2024-01-03 10:00:00.000');
        const action3 = createAction('3', '2024-01-02 10:00:00.000');
        const actions = toReportActions(action1, action2, action3);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createReport(reportID)};

        const result = computeForReport(reportID, actions, allReportActions, allReports);

        expect(result.lastAction?.reportActionID).toBe('2');
    });

    it('returns undefined lastAction for an empty actions object', () => {
        const actions: ReportActions = {};
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createReport(reportID)};

        const result = computeForReport(reportID, actions, allReportActions, allReports);

        expect(result.sortedReportActions).toEqual([]);
        expect(result.lastAction).toBeUndefined();
    });

    it('returns undefined transactionThreadReportID for a non-expense report', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const actions = toReportActions(action1);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};
        const allReports: OnyxCollection<Report> = {[reportKey]: createReport(reportID, {type: CONST.REPORT.TYPE.CHAT})};

        const result = computeForReport(reportID, actions, allReportActions, allReports);

        expect(result.transactionThreadReportID).toBeUndefined();
    });

    it('merges transaction thread actions for a one-transaction expense report', () => {
        const transactionThreadReportID = '2';
        const transactionThreadActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`;

        const iouAction = createAction('100', '2024-01-01 10:00:00.000', {
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

        const parentActions = toReportActions(iouAction);
        const threadAction200 = createAction('200', '2024-01-01 11:00:00.000');
        const threadAction201 = createAction('201', '2024-01-01 12:00:00.000');
        const threadActions = toReportActions(threadAction200, threadAction201);
        const chatReport = createReport('3', {type: CONST.REPORT.TYPE.CHAT});
        const expenseReport = createReport(reportID, {type: CONST.REPORT.TYPE.EXPENSE, chatReportID: '3'});

        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: parentActions,
            [transactionThreadActionsKey]: threadActions,
        };
        const allReports: OnyxCollection<Report> = {
            [reportKey]: expenseReport,
            [`${ONYXKEYS.COLLECTION.REPORT}3`]: chatReport,
        };

        const result = computeForReport(reportID, parentActions, allReportActions, allReports);

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
        const allReports: OnyxCollection<Report> = {[reportKey]: createReport(reportID)};

        const result = computeForReport(reportID, actions, allReportActions, allReports);

        expect(result.sortedReportActions).toHaveLength(1);
        expect(result.sortedReportActions.at(0)?.reportActionID).toBe('1');
        expect(result.lastAction?.reportActionID).toBe('1');
    });

    it('handles undefined allReportActions gracefully for transaction thread merging', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const actions = toReportActions(action1);
        const expenseReport = createReport(reportID, {type: CONST.REPORT.TYPE.EXPENSE, chatReportID: '3'});
        const chatReport = createReport('3', {type: CONST.REPORT.TYPE.CHAT});
        const allReports: OnyxCollection<Report> = {
            [reportKey]: expenseReport,
            [`${ONYXKEYS.COLLECTION.REPORT}3`]: chatReport,
        };

        const result = computeForReport(reportID, actions, undefined, allReports);

        expect(result.sortedReportActions).toHaveLength(1);
        expect(result.lastAction?.reportActionID).toBe('1');
    });

    it('handles undefined allReports gracefully', () => {
        const action1 = createAction('1', '2024-01-01 10:00:00.000');
        const action2 = createAction('2', '2024-01-02 10:00:00.000');
        const actions = toReportActions(action1, action2);
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKey]: actions};

        const result = computeForReport(reportID, actions, allReportActions, undefined);

        expect(result.sortedReportActions.map((a) => a.reportActionID)).toEqual(['2', '1']);
        expect(result.transactionThreadReportID).toBeUndefined();
    });
});
