import {beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import {DeviceEventEmitter} from 'react-native';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import {replaceOptimisticReportWithActualReport} from '@src/libs/actions/replaceOptimisticReportWithActualReport';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type SwitchReportEventData = {
    preexistingReportID: string;
    reportToCopyDraftTo: string;
    callback: () => void;
};

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockIsReady = jest.fn(() => false);
const mockGetActiveRoute = jest.fn(() => '');
const mockGetCurrentRoute = jest.fn(() => undefined as {name: string; params: Record<string, unknown>} | undefined);

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args) as void,
    setParams: (...args: unknown[]) => mockSetParams(...args) as void,
    getActiveRoute: () => mockGetActiveRoute(),
    navigationRef: {
        isReady: () => mockIsReady(),
        getCurrentRoute: () => mockGetCurrentRoute(),
    },
}));

const mockOpenReport = jest.fn();
jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    return {
        ...originalModule,
        openReport: (...args: unknown[]) => mockOpenReport(...args) as void,
    };
});

describe('replaceOptimisticReportWithActualReport', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        // Reset navigation mocks to default values
        mockIsReady.mockReturnValue(false);
        mockGetActiveRoute.mockReturnValue('');
        mockGetCurrentRoute.mockReturnValue(undefined);
        mockNavigate.mockClear();
        mockSetParams.mockClear();
        mockOpenReport.mockClear();
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

    it('should be triggered automatically when report with preexistingReportID is set in Onyx', async () => {
        // Given a preexisting report already in Onyx
        const reportID = '1';
        const preexistingReportID = '2';

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        // When an optimistic report with preexistingReportID is set in Onyx
        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // Then the replacement should happen automatically via Onyx callback
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();

        // And the preexisting report should be updated with cleared preexistingReportID
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport).toBeDefined();
        expect(updatedReport?.reportID).toBe(preexistingReportID);
        expect(updatedReport?.preexistingReportID).toBeFalsy();
    });

    it('should clean up stale optimistic IOU report and its report preview', async () => {
        // Given an optimistic IOU report with parent report info
        const parentReportID = '10';
        const parentReportActionID = 'action123';
        const reportID = '1';
        const preexistingReportID = '2';

        const report = createRandomReport(1, undefined);
        report.reportID = reportID;
        report.preexistingReportID = preexistingReportID;
        report.parentReportID = parentReportID;
        report.parentReportActionID = parentReportActionID;
        report.type = CONST.REPORT.TYPE.IOU;

        const parentAction = createRandomReportAction(1);
        parentAction.childReportID = reportID;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
            [parentReportActionID]: parentAction,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(report, undefined);

        await waitForBatchedUpdates();

        // Then the parent report action should be deleted
        const parentActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`);
        expect(parentActions?.[parentReportActionID]).toBeFalsy();

        // And the optimistic report should be deleted
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should merge optimistic DM report into preexisting report without draft comment', async () => {
        // Given an optimistic report and a preexisting report in Onyx
        const reportID = '1';
        const preexistingReportID = '2';
        const optimisticAccountID = 1;
        const existingAccountID = 2;

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

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Then the optimistic report should be deleted
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();

        // And the preexisting report should be updated with optimistic data but keep existing participants
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport).toBeDefined();
        expect(updatedReport?.reportID).toBe(preexistingReportID);
        expect(updatedReport?.preexistingReportID).toBeFalsy();
        expect(updatedReport?.participants).toEqual(existingReport.participants);
    });

    it('should handle preexisting report when participants is undefined in existing report', async () => {
        // Given an optimistic report with participants and an existing report without participants
        const reportID = '1';
        const preexistingReportID = '2';
        const accountID = 1;

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;
        optimisticReport.participants = {[accountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}};

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;
        existingReport.participants = undefined;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Then the preexisting report should use the optimistic report's participants
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport?.participants).toEqual(optimisticReport.participants);
    });

    it('should handle preexistingReportID for DM/group-DM and preserve participants', async () => {
        // Given an optimistic DM report without parent action
        const reportID = '1';
        const preexistingReportID = '2';
        const user1AccountID = 100;
        const user2AccountID = 200;

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;
        optimisticReport.type = CONST.REPORT.TYPE.CHAT;
        optimisticReport.participants = {
            [user1AccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [user2AccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        };

        optimisticReport.parentReportActionID = undefined;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;
        existingReport.type = CONST.REPORT.TYPE.CHAT;
        existingReport.participants = {
            [user1AccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY},
            [user2AccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE},
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Then the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();

        // And the preexisting report should preserve existing participants
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);
        expect(updatedReport?.participants).toEqual(existingReport.participants);
        expect(updatedReport?.preexistingReportID).toBeFalsy();
    });

    it('should merge preexisting report data correctly', async () => {
        // Given an optimistic report and a preexisting report with different data
        const reportID = '1';
        const preexistingReportID = '2';
        const accountID = 100;

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;
        optimisticReport.reportName = 'Optimistic Chat';
        optimisticReport.lastReadTime = '2026-01-27T10:00:00Z';
        optimisticReport.lastVisibleActionCreated = '2026-01-27T10:00:00Z';

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;
        existingReport.reportName = 'Original Chat';
        existingReport.lastReadTime = '2026-01-20T10:00:00Z';
        existingReport.lastVisibleActionCreated = '2026-01-20T10:00:00Z';
        existingReport.participants = {[accountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}};

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);

        await waitForBatchedUpdates();

        // Then the preexisting report should be updated with optimistic report data
        const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`);

        // Report ID should be the preexisting one
        expect(updatedReport?.reportID).toBe(preexistingReportID);

        // preexistingReportID should be cleared
        expect(updatedReport?.preexistingReportID).toBeFalsy();

        // Participants should be preserved from the existing report
        expect(updatedReport?.participants).toEqual(existingReport.participants);

        // Other data from the optimistic report should be merged
        expect(updatedReport?.reportName).toBe(optimisticReport.reportName);
    });

    it('should handle preexistingReportID for one-transaction report', async () => {
        // Given an IOU report with one transaction and an optimistic transaction thread report
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

        // When replaceOptimisticReportWithActualReport is called
        const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        if (report) {
            replaceOptimisticReportWithActualReport(report, undefined);
        }

        await waitForBatchedUpdates();

        // Then the optimistic report should be cleared
        const optimisticReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(optimisticReport).toBeFalsy();

        // And the childReportID of the IOU action should be updated to the preexisting report
        const iouReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
        expect(iouReportActions?.['1']?.childReportID).toBe(preexistingReportID);
    });

    it('should handle preexistingReportID for multi-transaction report', async () => {
        // Given an IOU report with multiple transactions and an optimistic transaction thread report
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

        // And the childReportID of the IOU action should be updated to the preexisting report
        const iouReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
        expect(iouReportActions?.[iouReportAction1.reportActionID]?.childReportID).toBe(preexistingReportID);
    });

    it('should handle preexistingReportID for thread under comment', async () => {
        // Given a parent chat report with a comment and an optimistic thread report
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

        // And the parent report action should be updated to point to the preexisting thread
        const parentChatReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`);
        expect(parentChatReportActions?.['1']?.childReportID).toBe(preexistingReportID);
    });

    it('should transfer draft comment to preexisting report when the user is not on the report', async () => {
        // Given an optimistic DM report with a draft comment and user on a different report
        const reportID = '1';
        const preexistingReportID = '2';
        const draftComment = 'This is a draft message';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue('/r/999');

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with a draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);

        await waitForBatchedUpdates();

        // Then the draft comment should be transferred to the preexisting report
        const preexistingDraftComment = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${preexistingReportID}`);
        expect(preexistingDraftComment).toBe(draftComment);

        // And the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should transfer draft comment to preexisting thread report for transaction thread', async () => {
        // Given an optimistic transaction thread with a parent IOU report and user on a different report
        const iouReportID = '9999';
        const chatReportID = '8888';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const draftComment = 'Draft for transaction thread';

        // Mock navigation to be ready
        mockIsReady.mockReturnValue(true);

        // User is on a different report
        mockGetActiveRoute.mockReturnValue('/r/999');

        const iouReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'trans123',
            },
            childReportID: preexistingReportID,
        };

        // Create an IOU report
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

        // Create the preexisting thread report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, {
            reportID: preexistingReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
        });

        // Create the optimistic transaction thread report
        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with a draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);

        await waitForBatchedUpdates();

        // Then the draft comment should be transferred to the preexisting thread report
        const preexistingDraftComment = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${preexistingReportID}`);
        expect(preexistingDraftComment).toBe(draftComment);

        // And the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should transfer draft comment to parent IOU report for one-transaction report when user is not on report', async () => {
        // Given an optimistic transaction thread under a one-transaction IOU report with user on a different report
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const draftComment = 'Draft for one-transaction thread';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue('/r/999');
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const reportActionID = '1';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with a draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);

        await waitForBatchedUpdates();

        // Then the draft comment should be transferred to the parent IOU report
        const parentDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${iouReportID}`);
        expect(parentDraft).toBe(draftComment);

        // And the preexisting thread should NOT have the draft
        const preexistingDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${preexistingReportID}`);
        expect(preexistingDraft).toBeFalsy();
    });

    it('should clear optimistic report draft comment after transfer', async () => {
        // Given an optimistic report with a draft comment stored in Onyx
        const reportID = '1';
        const preexistingReportID = '2';
        const draftComment = 'Draft to be cleared';

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, draftComment);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with the draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);

        await waitForBatchedUpdates();

        // Then the optimistic report's draft comment should be cleared from Onyx
        const optimisticDraftComment = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
        expect(optimisticDraftComment).toBeFalsy();
    });

    it('should navigate to preexisting report when user is focused on optimistic DM report', async () => {
        // Given an optimistic DM report with the user currently viewing it
        const reportID = '1';
        const preexistingReportID = '2';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${reportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        // Then the switchToPreExistingReport event should be emitted
        expect(eventCallback).toHaveBeenCalled();
        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        expect(eventData).toMatchObject({
            preexistingReportID,
            reportToCopyDraftTo: preexistingReportID,
        });

        // And when the callback is executed (simulating ComposerWithSuggestions behavior)
        eventData.callback();
        await waitForBatchedUpdates();

        // Then the navigation should update to the preexisting report
        expect(mockSetParams).toHaveBeenCalledWith({reportID: preexistingReportID});

        subscription.remove();
    });

    it('should navigate to parent IOU report when user is focused on transaction thread of one-transaction report', async () => {
        // Given an optimistic transaction thread under a one-transaction IOU report with the user viewing it
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${optimisticReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const iouReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'trans123',
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [iouReportAction.reportActionID]: iouReportAction,
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${optimisticReportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called and the callback is executed
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        eventData.callback();
        await waitForBatchedUpdates();

        // Then the navigation should go to the parent IOU report, not the preexisting thread
        expect(mockSetParams).toHaveBeenCalledWith({reportID: iouReportID});

        subscription.remove();
    });

    it('should navigate to preexisting thread when user is focused on thread under comment', async () => {
        // Given an optimistic thread under a chat comment with the user viewing it
        const chatReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const reportActionID = '1';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${optimisticReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                childReportID: optimisticReportID,
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: chatReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${optimisticReportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called and the callback is executed
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        eventData.callback();
        await waitForBatchedUpdates();

        // Then the navigation should go to the preexisting thread
        expect(mockSetParams).toHaveBeenCalledWith({reportID: preexistingReportID});

        subscription.remove();
    });

    it('should navigate to preexisting thread when user is focused on transaction thread of multi-transaction report', async () => {
        // Given an optimistic transaction thread under a multi-transaction IOU report with the user viewing it
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${optimisticReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const reportActionID1 = '1';
        const reportActionID2 = '2';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 2,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID1]: {
                reportActionID: reportActionID1,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans1'},
            },
            [reportActionID2]: {
                reportActionID: reportActionID2,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans2'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: '1',
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${optimisticReportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called and the callback is executed
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        eventData.callback();
        await waitForBatchedUpdates();

        // Then the navigation should go to the preexisting thread, NOT the parent IOU report
        expect(mockSetParams).toHaveBeenCalledWith({reportID: preexistingReportID});

        subscription.remove();
    });

    it('should update backTo route when optimistic report is in background on expense report screen', async () => {
        // Given an optimistic report in the background while user is on expense report screen with backTo pointing to it
        const reportID = '1';
        const preexistingReportID = '2';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue('/e/999');
        mockGetCurrentRoute.mockReturnValue({
            name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
            params: {backTo: `/r/${reportID}`},
        });

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called and the callback is executed
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        eventData.callback();
        await waitForBatchedUpdates();

        // Then the navigation should update the backTo route with the preexisting report ID
        expect(mockNavigate).toHaveBeenCalledWith(`/r/${preexistingReportID}`);

        subscription.remove();
    });

    it('should emit event with parent report as reportToCopyDraftTo for one-transaction report', async () => {
        // Given an optimistic transaction thread under a one-transaction IOU report with the user viewing it
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const reportActionID = '1';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${optimisticReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${optimisticReportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        // Then the emitted event should have the parent IOU report as reportToCopyDraftTo
        const eventData: SwitchReportEventData = eventCallback.mock.calls[0][0];
        expect(eventData.reportToCopyDraftTo).toBe(iouReportID);

        subscription.remove();
    });

    it('should NOT emit switchToPreExistingReport event when user is not on optimistic report', async () => {
        // Given an optimistic report with the user on a completely different report
        const reportID = '1';
        const preexistingReportID = '2';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue('/r/999');
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const optimisticReport = createRandomReport(Number(reportID), undefined);
        optimisticReport.reportID = reportID;
        optimisticReport.preexistingReportID = preexistingReportID;

        const existingReport = createRandomReport(Number(preexistingReportID), undefined);
        existingReport.reportID = preexistingReportID;

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, optimisticReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, existingReport);
        await waitForBatchedUpdates();

        const eventCallback = jest.fn();
        const subscription = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, eventCallback);

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        // Then the switchToPreExistingReport event should NOT be emitted
        expect(eventCallback).not.toHaveBeenCalled();

        // But the optimistic report should still be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        expect(deletedReport).toBeFalsy();

        subscription.remove();
    });

    it('should call openReport when user is already on parent one expense report', async () => {
        // Given an optimistic transaction thread under a one-transaction IOU report with the user on the parent IOU report
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${iouReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const reportActionID = '1';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        // Then openReport should be called with the parent IOU report ID
        expect(mockOpenReport).toHaveBeenCalledWith(iouReportID);

        // And the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should transfer draft to parent IOU report and call openReport when user is already on parent one expense report', async () => {
        // Given an optimistic transaction thread with a draft comment under a one-transaction IOU report with the user on the parent
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const draftComment = 'Draft while on parent report';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/r/${iouReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {}});

        const reportActionID = '1';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with a draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);
        await waitForBatchedUpdates();

        // Then the draft should be transferred to the parent IOU report
        const parentDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${iouReportID}`);
        expect(parentDraft).toBe(draftComment);

        // And openReport should be called after the draft is saved
        expect(mockOpenReport).toHaveBeenCalledWith(iouReportID);

        // And the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(deletedReport).toBeFalsy();
    });

    it('should call openReport when user is on search report view of parent one expense report', async () => {
        // Given an optimistic transaction thread under a one-transaction IOU report with the user on the search report view
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/search/view/${iouReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.SEARCH.MONEY_REQUEST_REPORT, params: {}});

        const reportActionID = '1';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called
        replaceOptimisticReportWithActualReport(optimisticReport, undefined);
        await waitForBatchedUpdates();

        // Then openReport should be called with the parent IOU report ID
        expect(mockOpenReport).toHaveBeenCalledWith(iouReportID);
    });

    it('should transfer draft to parent IOU report and call openReport when user is on search report view with draft comment', async () => {
        // Given an optimistic transaction thread with a draft comment under a one-transaction IOU report with the user on search view
        const iouReportID = '9999';
        const optimisticReportID = '1234';
        const preexistingReportID = '5555';
        const draftComment = 'Draft while on search view';

        mockIsReady.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(`/search/view/${iouReportID}`);
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.SEARCH.MONEY_REQUEST_REPORT, params: {}});

        const reportActionID = '1';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            reportID: iouReportID,
            type: CONST.REPORT.TYPE.IOU,
            transactionCount: 1,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
            [reportActionID]: {
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'trans123'},
            },
        });

        const optimisticReport = {
            reportID: optimisticReportID,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: iouReportID,
            parentReportActionID: reportActionID,
            preexistingReportID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`, optimisticReport);
        await waitForBatchedUpdates();

        // When replaceOptimisticReportWithActualReport is called with a draft comment
        replaceOptimisticReportWithActualReport(optimisticReport, draftComment);
        await waitForBatchedUpdates();

        // Then the draft should be transferred to the parent IOU report
        const parentDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${iouReportID}`);
        expect(parentDraft).toBe(draftComment);

        // And openReport should be called after the draft is saved
        expect(mockOpenReport).toHaveBeenCalledWith(iouReportID);

        // And the optimistic report should be cleared
        const deletedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`);
        expect(deletedReport).toBeFalsy();
    });
});
