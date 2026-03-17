import type {OnyxCollection} from 'react-native-onyx';
import {computeReportActionsState} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

const makeReportAction = (id: number, created: string) =>
    ({
        reportActionID: id.toString(),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: 1,
        created,
        message: [{type: 'COMMENT', text: `message ${id}`, html: `message ${id}`}],
        originalMessage: {},
        person: [{type: 'TEXT', text: 'User', style: 'strong'}],
        avatar: '',
        automatic: false,
        shouldShow: true,
        lastModified: created,
    }) as unknown as ReportAction;

function buildReportActions(...items: ReportAction[]): ReportActions {
    const result: ReportActions = {};
    for (const item of items) {
        result[item.reportActionID] = item;
    }
    return result;
}

describe('computeReportActionsState', () => {
    it('should return the most recent action as lastAction', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(
                makeReportAction(100, '2024-01-01 10:00:00.000'),
                makeReportAction(101, '2024-01-02 10:00:00.000'),
                makeReportAction(102, '2024-01-03 10:00:00.000'),
            ),
        };

        const result = computeReportActionsState('1', actions, {});
        expect(result.lastAction?.reportActionID).toBe('102');
    });

    it('should return sortedActions in descending order', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(
                makeReportAction(100, '2024-01-01 10:00:00.000'),
                makeReportAction(101, '2024-01-03 10:00:00.000'),
                makeReportAction(102, '2024-01-02 10:00:00.000'),
            ),
        };

        const result = computeReportActionsState('1', actions, {});
        expect(result.sortedActions).toHaveLength(3);
        // Descending: newest first
        expect(result.sortedActions.at(0)?.reportActionID).toBe('101');
        expect(result.sortedActions.at(1)?.reportActionID).toBe('102');
        expect(result.sortedActions.at(2)?.reportActionID).toBe('100');
    });

    it('should return undefined lastAction when report has no actions', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(),
        };

        const result = computeReportActionsState('1', actions, {});
        expect(result.lastAction).toBeUndefined();
        expect(result.sortedActions).toHaveLength(0);
    });

    it('should return undefined transactionThreadReportID when no reports provided', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(makeReportAction(100, '2024-01-01 10:00:00.000')),
        };

        const result = computeReportActionsState('1', actions, {});
        expect(result.transactionThreadReportID).toBeUndefined();
    });

    it('should process multiple reports independently from the same actions collection', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(makeReportAction(100, '2024-01-01 10:00:00.000'), makeReportAction(101, '2024-01-02 10:00:00.000')),
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: buildReportActions(
                makeReportAction(200, '2024-03-01 10:00:00.000'),
                makeReportAction(201, '2024-03-02 10:00:00.000'),
                makeReportAction(202, '2024-03-03 10:00:00.000'),
            ),
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: buildReportActions(makeReportAction(300, '2024-05-01 10:00:00.000')),
        };

        const result1 = computeReportActionsState('1', actions, {});
        const result2 = computeReportActionsState('2', actions, {});
        const result3 = computeReportActionsState('3', actions, {});

        expect(result1.sortedActions).toHaveLength(2);
        expect(result1.lastAction?.reportActionID).toBe('101');

        expect(result2.sortedActions).toHaveLength(3);
        expect(result2.lastAction?.reportActionID).toBe('202');

        expect(result3.sortedActions).toHaveLength(1);
        expect(result3.lastAction?.reportActionID).toBe('300');
    });

    it('should produce consistent results when called multiple times with the same input', () => {
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(makeReportAction(100, '2024-01-01 10:00:00.000'), makeReportAction(101, '2024-01-02 10:00:00.000')),
        };

        const result1 = computeReportActionsState('1', actions, {});
        const result2 = computeReportActionsState('1', actions, {});

        expect(result1.lastAction?.reportActionID).toBe(result2.lastAction?.reportActionID);
        expect(result1.sortedActions.map((a) => a.reportActionID)).toEqual(result2.sortedActions.map((a) => a.reportActionID));
        expect(result1.transactionThreadReportID).toBe(result2.transactionThreadReportID);
    });

    it('should reflect updated data when actions change', () => {
        const action100 = makeReportAction(100, '2024-01-01 10:00:00.000');
        const action101 = makeReportAction(101, '2024-01-02 10:00:00.000');

        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(action100, action101),
        };

        const result1 = computeReportActionsState('1', actions, {});
        expect(result1.lastAction?.reportActionID).toBe('101');
        expect(result1.sortedActions).toHaveLength(2);

        // Add a newer action
        const action103 = makeReportAction(103, '2024-01-03 10:00:00.000');
        const updatedActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: buildReportActions(action100, action101, action103),
        };

        const result2 = computeReportActionsState('1', updatedActions, {});
        expect(result2.lastAction?.reportActionID).toBe('103');
        expect(result2.sortedActions).toHaveLength(3);
    });
});
