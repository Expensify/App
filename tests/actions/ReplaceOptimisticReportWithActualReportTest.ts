import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import {replaceOptimisticReportWithActualReport} from '@src/libs/actions/replaceOptimisticReportWithActualReport';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setParams: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    navigationRef: {
        isReady: jest.fn(() => false),
        getCurrentRoute: jest.fn(),
    },
}));

describe('replaceOptimisticReportWithActualReport', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should do nothing if reportID is missing', async () => {
        const report = createRandomReport(1, undefined);
        report.reportID = '';
        report.preexistingReportID = '2';

        replaceOptimisticReportWithActualReport(report, undefined);

        await waitForBatchedUpdates();

        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}1`);
        expect(updatedReport).toBeUndefined();
    });

    it('should do nothing if preexistingReportID is missing', async () => {
        const report = createRandomReport(1, undefined);
        report.reportID = '1';
        report.preexistingReportID = undefined;

        replaceOptimisticReportWithActualReport(report, undefined);

        await waitForBatchedUpdates();

        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}1`);
        expect(updatedReport).toBeUndefined();
    });

    it('should clean up stale optimistic IOU report and its report preview', async () => {
        const parentReportID = '10';
        const parentReportActionID = 'action123';
        const reportID = '1';
        const preexistingReportID = '2';

        // Create an IOU report with parent info
        const report = createRandomReport(1, undefined);
        report.reportID = reportID;
        report.preexistingReportID = preexistingReportID;
        report.parentReportID = parentReportID;
        report.parentReportActionID = parentReportActionID;
        report.type = CONST.REPORT.TYPE.IOU;

        const parentAction = createRandomReportAction(1);
        parentAction.childReportID = reportID;

        // Set up parent report with action
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
            [parentReportActionID]: parentAction,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await waitForBatchedUpdates();

        replaceOptimisticReportWithActualReport(report, undefined);

        await waitForBatchedUpdates();

        // Verify the parent report action is set to null (deleted)
        const parentActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`);
        expect(parentActions?.[parentReportActionID]).toBeFalsy();

        // Verify the optimistic report is set to null (deleted) - Onyx returns undefined for deleted keys
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should merge optimistic DM report into preexisting report without draft comment', async () => {
        const reportID = '1';
        const preexistingReportID = '2';
        const optimisticAccountID = 1;
        const existingAccountID = 2;

        // Create optimistic and preexisting reports
        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;
        optimisticReport.reportName = 'Optimistic Report';
        optimisticReport.participants = {[optimisticAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}};

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;
        existingReport.reportName = 'Existing Report';
        existingReport.participants = {[existingAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}};

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Verify optimistic report is deleted - Onyx returns undefined for deleted keys
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();

        // Verify preexisting report is updated with optimistic data but keeps existing participants
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport).toBeDefined();
        expect(updatedReport?.reportID).toBe(preexistingReportID);
        expect(updatedReport?.preexistingReportID).toBeFalsy();
        expect(updatedReport?.participants).toEqual(existingReport.participants);
    });

    it('should handle preexisting report when participants is undefined in existing report', async () => {
        const reportID = '1';
        const preexistingReportID = '2';
        const accountID = 1;

        // Create optimistic report with participants
        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;
        optimisticReport.participants = {[accountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}};

        // Create existing report without participants
        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;
        existingReport.participants = undefined;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Verify preexisting report uses optimistic report's participants when existing has none
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport?.participants).toEqual(optimisticReport.participants);
    });

    it('should handle preexistingReportID for one-transaction report', async () => {
        // Given an IOU report with one transaction
        const iouReportID = '9999';
        const chatReportID = '8888';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const iouReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'trans123',
            },
            childReportID: preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            chatReportID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [iouReportAction.reportActionID]: iouReportAction,
        });

        // Create the optimistic report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [iouReportAction.reportActionID]: {
                childReportID: optimisticReportID,
            },
        });

        // When OpenReport API is called, it returns preexistingReportID and reportID
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            preexistingReportID,
        });

        await waitForBatchedUpdates();

        // Then replaceOptimisticReportWithActualReport is called
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        if (report) {
            replaceOptimisticReportWithActualReport(report, undefined);
        }

        await waitForBatchedUpdates();

        // Then the optimistic report should be cleared
        const optimisticReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(optimisticReport).toBeFalsy();

        // Then the childReportID of the IOU action should be updated
        const iouReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
        expect(iouReportActions?.['1']?.childReportID).toBe(preexistingReportID);
    });

    it('should handle preexistingReportID for multi-transaction report', async () => {
        // Given an IOU report with multiple transactions
        const iouReportID = '9999';
        const chatReportID = '8888';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const iouReportAction1 = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'trans123',
            },
            childReportID: preexistingReportID,
        };
        const iouReportAction2 = {
            reportActionID: '2',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'trans456',
            },
            childReportID: '6666',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            chatReportID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [iouReportAction1.reportActionID]: iouReportAction1,
            [iouReportAction2.reportActionID]: iouReportAction2,
        });

        // Given that we create an optimistic transaction thread report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
        });

        // Given that we update the childReportID of the first IOU action points to the optimistic report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [iouReportAction1.reportActionID]: {
                childReportID: optimisticReportID,
            },
        });

        // When OpenReport API is called, it returns preexistingReportID and reportID
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            preexistingReportID,
        });

        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        if (report) {
            replaceOptimisticReportWithActualReport(report, undefined);
        }

        await waitForBatchedUpdates();

        // Then the optimistic report should be cleared
        const optimisticReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(optimisticReport).toBeFalsy();

        // Then the childReportID of the IOU action should be updated
        const iouReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
        expect(iouReportActions?.[iouReportAction1.reportActionID]?.childReportID).toBe(preexistingReportID);
    });

    it('should handle preexistingReportID for thread under comment', async () => {
        // Given a parent chat report with a comment
        const chatReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const commentReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: [{type: 'TEXT', text: 'Test comment'}],
            childReportID: preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
            [commentReportAction.reportActionID]: commentReportAction,
        });

        // Given that we create an optimistic thread report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: chatReportID,
            parentReportActionID: '1',
        });

        // Given that we update the childReportID of the comment action points to the optimistic report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
            [commentReportAction.reportActionID]: {
                childReportID: optimisticReportID,
            },
        });

        // When OpenReport API is called, it returns preexistingReportID and reportID
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, {
            reportID: optimisticReportID,
            preexistingReportID,
        });

        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        if (report) {
            replaceOptimisticReportWithActualReport(report, undefined);
        }

        await waitForBatchedUpdates();

        // Then the optimistic report should be cleared
        const optimisticReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(optimisticReport).toBeFalsy();

        // And the parent report action should be updated to point to preexisting thread
        const parentChatReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`);
        expect(parentChatReportActions?.['1']?.childReportID).toBe(preexistingReportID);
    });
});
