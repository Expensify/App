import Onyx from 'react-native-onyx';
import deleteReport from '@libs/actions/Report/DeleteReport';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock Log to avoid noise in tests
jest.mock('@libs/Log');

describe('actions/Report/DeleteReport', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    it('should delete a report, its actions, and linked transactions', async () => {
        // Given a report with an IOU action and a linked transaction
        const reportID = '1';
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        const transaction = createRandomTransaction(Number(transactionID));
        const reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
            ...createRandomReportAction(100),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            previousMessage: [],
            message: [{text: '', html: 'iou', type: 'COMMENT'}],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: transaction.transactionID,
                IOUDetails: {
                    amount: transaction.amount,
                    currency: transaction.currency,
                    comment: '',
                },
            },
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [reportAction.reportActionID]: reportAction,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        // When we delete the report
        deleteReport(reportID);

        await waitForBatchedUpdates();

        // Then the report, its actions, and the linked transaction should be deleted
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`)).toBeUndefined();
    });

    it('should delete child reports recursively when shouldDeleteChildReports is true', async () => {
        // Given a parent report with a child report
        const parentReportID = '1';
        const childReportID = '2';
        const parentReport = createRandomReport(Number(parentReportID), undefined);
        const childReport = createRandomReport(Number(childReportID), undefined);
        const parentAction = {
            ...createRandomReportAction(100),
            childReportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`, childReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
            [parentAction.reportActionID]: parentAction,
        });

        // When we delete the parent report with shouldDeleteChildReports set to true
        deleteReport(parentReportID, true);

        await waitForBatchedUpdates();

        // Then both the parent and child reports should be deleted
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`)).toBeUndefined();
    });

    it('should delete linked IOU reports recursively', async () => {
        // Given a report with a linked IOU report
        const reportID = '1';
        const iouReportID = '2';
        const report = {
            ...createRandomReport(Number(reportID), undefined),
            iouReportID,
        };
        const iouReport = createRandomReport(Number(iouReportID), undefined);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);

        // When we delete the report
        deleteReport(reportID);

        await waitForBatchedUpdates();

        // Then both reports should be deleted
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`)).toBeUndefined();
    });
});
