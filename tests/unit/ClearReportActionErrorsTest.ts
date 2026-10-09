import {clearAllRelatedReportActionErrors} from '@libs/actions/ClearReportActionErrors';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '1';
const PARENT_REPORT_ID = '2';
const CHILD_REPORT_ID = '3';
const GRANDPARENT_REPORT_ID = '4';
const REPORT_ACTION_ID = '100';
const PARENT_REPORT_ACTION_ID = '200';
const CHILD_REPORT_ACTION_ID = '300';
const GRANDPARENT_REPORT_ACTION_ID = '400';

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
            // Given a report exists in Onyx
            const report = createMockReport();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called with null reportAction
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction: null, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then no report actions should be created or modified
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportAction is undefined', async () => {
            // Given no initial state

            // When clearAllRelatedReportActionErrors is called with undefined reportAction
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction: undefined, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then no report actions should be created or modified
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportAction has no errors', async () => {
            // Given a report action with no errors
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {errors: undefined});

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then no report actions should be created or modified
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should return early when reportID is undefined', async () => {
            // Given a report action with errors
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {errors: {error1: 'Error message'}});

            // When clearAllRelatedReportActionErrors is called with undefined reportID
            clearAllRelatedReportActionErrors({reportID: undefined, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then no report actions should be created or modified
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should clear only specified error keys when keys parameter is provided', async () => {
            // Given a report action with multiple errors in Onyx
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {error1: 'Error 1', error2: 'Error 2', error3: 'Error 3'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called with specific keys to clear
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false, keys: ['error1', 'error2']});
            await waitForBatchedUpdates();

            // Then only the specified errors should be cleared, leaving error3
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toEqual({
                error3: 'Error 3',
            });
        });

        it('should delete isOptimisticAction report action instead of clearing errors', async () => {
            // Given an optimistic report action with errors in Onyx
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {error1: 'Error message'},
                isOptimisticAction: true,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the entire report action should be deleted (not just errors cleared)
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });

        it('should clear errors on parent report action when matching error keys exist', async () => {
            // Given a child report with parent reference and both have errors with matching keys
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called on the child action
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the parent action's matching error should also be cleared
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({});
        });

        it('should clear the mirrored pay error on the chat preview without deleting the preview itself', async () => {
            // Given a failed payment: the optimistic pay action inside the IOU report and the chat's report preview
            // both carry the same error key, which is what links them.
            const iouReport = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const payAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                // A failed optimistic pay action keeps its ADD pending state, so dismissing it removes the action.
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: {[CONST.IOU.PAY_FAILURE_PREVIEW_ERROR_KEY]: 'Unexpected error. Please try again later.'},
            });
            const reportPreviewAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                errors: {[CONST.IOU.PAY_FAILURE_PREVIEW_ERROR_KEY]: 'Unexpected error. Please try again later.'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: payAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {[PARENT_REPORT_ACTION_ID]: reportPreviewAction});
            await waitForBatchedUpdates();

            // When the payer dismisses the error from inside the expense report
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction: payAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the copy on the chat preview is cleared too, so a dismissed error cannot resurface later when the
            // expense is deleted and that preview becomes visible again.
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({});

            // And the preview survives. It is a real server action, so it must not take the optimistic-delete path.
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]).toBeTruthy();
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
        });

        it('should not clear parent errors when ignore is set to parent', async () => {
            // Given a child report with parent reference and both have errors with matching keys
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called with ignore='parent'
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false, ignore: 'parent'});
            await waitForBatchedUpdates();

            // Then the parent action's error should remain unchanged
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Parent error message'});
        });

        it('should not clear child errors when ignore is set to child', async () => {
            // Given a parent action with childReportID and both have errors with matching keys
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                childReportID: CHILD_REPORT_ID,
                errors: {sharedError: 'Error message'},
            });
            const childReportAction = getFakeReportAction(Number(CHILD_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called with ignore='child'
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false, ignore: 'child'});
            await waitForBatchedUpdates();

            // Then the child action's error should remain unchanged
            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Child error message'});
        });

        it('should not clear parent errors when error keys do not match', async () => {
            // Given a child report with parent reference where error keys are different
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {error1: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the parent action's error should remain because the keys don't match
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({differentError: 'Parent error message'});
        });

        it('should use originalReportID for clearing errors when it differs from reportID', async () => {
            // Given a report action stored under a different originalReportID
            const originalReportID = '999';
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {errors: {error1: 'Error message'}});

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called with different reportID and originalReportID
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the errors should be cleared from the originalReportID location
            const reportActions = await getReportActionsFromOnyx(originalReportID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
        });

        it('should handle empty errors object', async () => {
            // Given a report action with an empty errors object
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {errors: {}});

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then no report actions should be created or modified (early return)
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions).toBeUndefined();
        });

        it('should handle report action without reportActionID', async () => {
            // Given a report action with empty reportActionID in Onyx
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {reportActionID: '', errors: {error1: 'Error message'}});

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the report action should remain unchanged (early return due to missing reportActionID)
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeDefined();
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toEqual({error1: 'Error message'});
        });

        it('should clear multiple child report action errors', async () => {
            // Given a parent action with childReportID pointing to a report with multiple actions
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                childReportID: CHILD_REPORT_ID,
                errors: {sharedError: 'Error message'},
            });
            const childReportAction1 = getFakeReportAction(Number(CHILD_REPORT_ACTION_ID), {
                errors: {sharedError: 'Child error message 1'},
            });
            const childReportAction2 = getFakeReportAction(301, {
                errors: {sharedError: 'Child error message 2'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMockReport());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                [CHILD_REPORT_ACTION_ID]: childReportAction1,

                // It's OK to disable the rule here because the key needs to be numeric for reportActionIDs
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '301': childReportAction2,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then all child actions with matching error keys should have their errors cleared
            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({});
            expect(childReportActions?.['301']?.errors).toEqual({});
        });

        it('should only clear child errors that match the error keys', async () => {
            // Given a parent action and child action where child has additional non-matching errors
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                childReportID: CHILD_REPORT_ID,
                errors: {error1: 'Error message'},
            });
            const childReportAction = getFakeReportAction(Number(CHILD_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then only matching errors should be cleared, leaving non-matching errors intact
            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({error2: 'Child error 2'});
        });

        it('should clear parent errors using the reports parameter when the report is not in Onyx', async () => {
            // Given report actions with matching error keys on both levels, and the parent hierarchy supplied
            // only via the reports parameter (the REPORT collection is deliberately not seeded, proving the
            // parent walk reads the caller-supplied data rather than a hidden Onyx cache)
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
                errors: {sharedError: 'Parent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called with the hierarchy passed as the reports parameter
            clearAllRelatedReportActionErrors({
                reportID: REPORT_ID,
                reportAction,
                originalReportID: REPORT_ID,
                isOffline: false,
                reports: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID},
                },
            });
            await waitForBatchedUpdates();

            // Then the parent action's matching error should be cleared
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({});
        });

        it('should clear errors across a multi-level ancestor chain supplied via the reports parameter', async () => {
            // Given a three-level chain (report -> parent -> grandparent) whose hierarchy exists ONLY in the
            // reports parameter (the REPORT collection is not seeded), so the walk can only reach the
            // grandparent if the recursive call threads the parameter into every frame
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
                errors: {sharedError: 'Parent error message'},
            });
            const grandparentReportAction = getFakeReportAction(Number(GRANDPARENT_REPORT_ACTION_ID), {
                errors: {sharedError: 'Grandparent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${GRANDPARENT_REPORT_ID}`, {
                [GRANDPARENT_REPORT_ACTION_ID]: grandparentReportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called with the full hierarchy in the reports parameter
            clearAllRelatedReportActionErrors({
                reportID: REPORT_ID,
                reportAction,
                originalReportID: REPORT_ID,
                isOffline: false,
                reports: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID},
                    [`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`]: {parentReportID: GRANDPARENT_REPORT_ID, parentReportActionID: GRANDPARENT_REPORT_ACTION_ID},
                },
            });
            await waitForBatchedUpdates();

            // Then the matching errors should be cleared at every level of the chain
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({});
            const grandparentReportActions = await getReportActionsFromOnyx(GRANDPARENT_REPORT_ID);
            expect(grandparentReportActions?.[GRANDPARENT_REPORT_ACTION_ID]?.errors).toEqual({});
        });

        it('should not clear parent errors when the supplied reports collection does not contain the report', async () => {
            // Given a report in Onyx with a parent reference, but a caller-supplied reports collection that is
            // missing that report (the function must trust the caller's data and not fall back to Onyx per key)
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
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

            // When clearAllRelatedReportActionErrors is called with an empty reports collection
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false, reports: {}});
            await waitForBatchedUpdates();

            // Then the parent action's error should remain because the supplied collection has no parent link
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Parent error message'});
        });

        it('should not walk to the parent when the report exists only as a draft', async () => {
            // Given a report that exists only in the REPORT_DRAFT collection with a parent reference
            // (the lookup must resolve from the REPORT collection only — draft reports must never
            // trigger the parent walk, so a draft-reading helper must not be swapped in as the fallback)
            const report = createMockReport({
                parentReportID: PARENT_REPORT_ID,
                parentReportActionID: PARENT_REPORT_ACTION_ID,
            });
            const reportAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                errors: {sharedError: 'Error message'},
            });
            const parentReportAction = getFakeReportAction(Number(PARENT_REPORT_ACTION_ID), {
                errors: {sharedError: 'Parent error message'},
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
                [PARENT_REPORT_ACTION_ID]: parentReportAction,
            });
            await waitForBatchedUpdates();

            // When clearAllRelatedReportActionErrors is called without a reports parameter
            clearAllRelatedReportActionErrors({reportID: REPORT_ID, reportAction, originalReportID: REPORT_ID, isOffline: false});
            await waitForBatchedUpdates();

            // Then the parent action's error should remain because draft reports do not trigger the parent walk
            const parentReportActions = await getReportActionsFromOnyx(PARENT_REPORT_ID);
            expect(parentReportActions?.[PARENT_REPORT_ACTION_ID]?.errors).toEqual({sharedError: 'Parent error message'});
        });
    });
});
