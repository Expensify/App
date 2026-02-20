import Onyx from 'react-native-onyx';
import {clearAllRelatedReportActionErrors} from '@libs/actions/ClearReportActionErrors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '1';
const PARENT_REPORT_ID = '2';
const CHILD_REPORT_ID = '3';
const REPORT_ACTION_ID = '100';
const PARENT_REPORT_ACTION_ID = '200';
const CHILD_REPORT_ACTION_ID = '300';

function createMockReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: REPORT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: 1,
        created: '2024-01-01 00:00:00.000',
        message: [{type: 'TEXT', text: 'Test message'}],
        errors: {error1: 'Error message'},
        ...overrides,
    } as ReportAction;
}

function createMockReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        reportName: 'Test Report',
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    } as Report;
}

function getReportActionsFromOnyx(reportID: string): Promise<ReportActions | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('ClearReportActionErrors', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        Onyx.clear();
    });

    describe('clearAllRelatedReportActionErrors', () => {
        it('should return early when reportAction is null', async () => {
            const report = createMockReport();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, null, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportAction is undefined', async () => {
            clearAllRelatedReportActionErrors(REPORT_ID, undefined, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportAction has no errors', async () => {
            const reportAction = createMockReportAction({errors: undefined});

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportID is undefined', async () => {
            const reportAction = createMockReportAction();

            clearAllRelatedReportActionErrors(undefined, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should clear errors on the current report action', async () => {
            const reportAction = createMockReportAction();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
        });

        it('should clear only specified error keys when keys parameter is provided', async () => {
            const reportAction = createMockReportAction({
                errors: {error1: 'Error 1', error2: 'Error 2', error3: 'Error 3'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID, undefined, ['error1', 'error2']);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toEqual({
                error3: 'Error 3',
            });
        });

        it('should delete optimistic report action instead of clearing errors', async () => {
            const reportAction = createMockReportAction({
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });

        it('should delete isOptimisticAction report action instead of clearing errors', async () => {
            const reportAction = createMockReportAction({
                isOptimisticAction: true,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });

        it('should clear errors on parent report action when matching error keys exist', async () => {
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = createMockReportAction({
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = createMockReportAction({
                reportActionID: PARENT_REPORT_ACTION_ID,
                errors: {sharedError: 'Parent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({});
        });

        it('should not clear parent errors when ignore is set to parent', async () => {
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = createMockReportAction({
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = createMockReportAction({
                reportActionID: PARENT_REPORT_ACTION_ID,
                errors: {sharedError: 'Parent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID, 'parent');
            await waitForBatchedUpdates();

            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Parent error message'});
        });

        it('should clear errors on child report actions when matching error keys exist', async () => {
            const reportAction = createMockReportAction({
                childReportID: CHILD_REPORT_ID,
                errors: {sharedError: 'Error message'},
            });
            const childReportAction = createMockReportAction({
                reportActionID: CHILD_REPORT_ACTION_ID,
                errors: {sharedError: 'Child error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMockReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                [CHILD_REPORT_ACTION_ID]: childReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({});
        });

        it('should not clear child errors when ignore is set to child', async () => {
            const reportAction = createMockReportAction({
                childReportID: CHILD_REPORT_ID,
                errors: {sharedError: 'Error message'},
            });
            const childReportAction = createMockReportAction({
                reportActionID: CHILD_REPORT_ACTION_ID,
                errors: {sharedError: 'Child error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMockReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                [CHILD_REPORT_ACTION_ID]: childReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID, 'child');
            await waitForBatchedUpdates();

            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Child error message'});
        });

        it('should not clear parent errors when error keys do not match', async () => {
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = createMockReportAction({
                errors: {error1: 'Error message'},
            });
            const parentReportAction = createMockReportAction({
                reportActionID: PARENT_REPORT_ACTION_ID,
                errors: {differentError: 'Parent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({differentError: 'Parent error message'});
        });

        it('should use originalReportID for clearing errors when it differs from reportID', async () => {
            const originalReportID = '999';
            const reportAction = createMockReportAction();

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, originalReportID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(originalReportID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
        });

        it('should handle empty errors object', async () => {
            const reportAction = createMockReportAction({errors: {}});

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should handle report action without reportActionID', async () => {
            const reportAction = createMockReportAction({reportActionID: ''});

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeDefined();
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toEqual({error1: 'Error message'});
        });

        it('should clear multiple child report action errors', async () => {
            const reportAction = createMockReportAction({
                childReportID: CHILD_REPORT_ID,
                errors: {sharedError: 'Error message'},
            });
            const childReportAction1 = createMockReportAction({
                reportActionID: CHILD_REPORT_ACTION_ID,
                errors: {sharedError: 'Child error message 1'},
            });
            const childReportAction2 = createMockReportAction({
                reportActionID: '301',
                errors: {sharedError: 'Child error message 2'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMockReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                [CHILD_REPORT_ACTION_ID]: childReportAction1,
                '301': childReportAction2,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({});
            expect(childReportActions?.['301']?.errors).toEqual({});
        });

        it('should only clear child errors that match the error keys', async () => {
            const reportAction = createMockReportAction({
                childReportID: CHILD_REPORT_ID,
                errors: {error1: 'Error message'},
            });
            const childReportAction = createMockReportAction({
                reportActionID: CHILD_REPORT_ACTION_ID,
                errors: {error1: 'Child error 1', error2: 'Child error 2'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMockReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                [CHILD_REPORT_ACTION_ID]: childReportAction,
            });
            await waitForBatchedUpdates();

            clearAllRelatedReportActionErrors(REPORT_ID, reportAction, REPORT_ID);
            await waitForBatchedUpdates();

            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({error2: 'Child error 2'});
        });
    });
});
