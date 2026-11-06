import reconcileScanTransactionThreads from '@libs/actions/IOU/reconcileScanTransactionThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('reconcileScanTransactionThreads', () => {
    const sourceReportID = '100';
    const destinationReportID = '200';
    const threadID = '300';
    const transactionID = '400';
    const actionID = '500';
    const threadKey = `${ONYXKEYS.COLLECTION.REPORT}${threadID}` as const;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceReportID}`, {
            [actionID]: {
                reportActionID: actionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadID,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactionID},
            },
        });
        await Onyx.set(threadKey, {reportID: threadID, parentReportID: sourceReportID, parentReportActionID: actionID, chatReportID: sourceReportID});
        await waitForBatchedUpdates();
    });

    it('moves the thread with its transaction before the source actions are removed', () => {
        // Given the thread still points to the source whose replacement is confirmed
        // When no explicit thread metadata is included in the scan response
        const updates = reconcileScanTransactionThreads(sourceReportID, destinationReportID, []);

        // Then preserve the thread identity and re-parent it to the surviving report
        expect(updates).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: threadKey, value: {parentReportID: destinationReportID, parentReportActionID: actionID, chatReportID: destinationReportID}},
        ]);
    });

    it('uses the server action identity matched by transaction rather than assuming the old ID survived', () => {
        // Given the destination action has a different ID for the same transaction
        const destinationActionID = '600';
        const responseUpdates: AnyOnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${destinationReportID}`,
                value: {
                    [destinationActionID]: {
                        reportActionID: destinationActionID,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactionID},
                    },
                },
            },
        ];

        // When the source is replaced
        const updates = reconcileScanTransactionThreads(sourceReportID, destinationReportID, responseUpdates);

        // Then the editor can resolve the correct destination action
        expect(updates).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: threadKey, value: {parentReportID: destinationReportID, parentReportActionID: destinationActionID, chatReportID: destinationReportID}},
        ]);
    });

    it('does not overwrite parent metadata explicitly returned by the server', () => {
        // Given the response already supplies the canonical parent action
        const responseUpdates: AnyOnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: threadKey, value: {parentReportActionID: 'server-action'}}];

        // When building the missing thread updates
        const updates = reconcileScanTransactionThreads(sourceReportID, destinationReportID, responseUpdates);

        // Then only the fields absent from the response are filled in
        expect(updates).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key: threadKey, value: {parentReportID: destinationReportID, chatReportID: destinationReportID}}]);
    });

    it('does not move a thread that has already been re-parented by a newer update', async () => {
        // Given a newer live update has already moved the thread elsewhere
        await Onyx.merge(threadKey, {parentReportID: 'newer-report'});
        await waitForBatchedUpdates();

        // When an older replacement is reconciled
        const updates = reconcileScanTransactionThreads(sourceReportID, destinationReportID, []);

        // Then that newer parent is not reverted
        expect(updates).toEqual([]);
    });

    it('does not resurrect a thread deleted by the response', () => {
        // Given the server explicitly deletes the old thread
        // When building its report replacement cleanup
        const updates = reconcileScanTransactionThreads(sourceReportID, destinationReportID, [{onyxMethod: Onyx.METHOD.MERGE, key: threadKey, value: null}]);

        // Then no thread metadata is appended after that deletion
        expect(updates).toEqual([]);
    });
});
