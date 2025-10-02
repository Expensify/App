import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {getBrickRoadForPolicy, getChatTabBrickRoad, getChatTabBrickRoadReportID} from '@libs/WorkspacesSettingsUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import mockData from './WorkspacesSettingsUtilsTest.json';

describe('WorkspacesSettingsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });
    describe('getBrickRoadForPolicy', () => {
        it('Should return "error"', async () => {
            const report = Object.values(mockData.reports)?.at(0);
            const transactionViolations = mockData.transactionViolations;
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                ...(transactionViolations as OnyxCollection<TransactionViolations>),
                ...(transactions as OnyxCollection<Transaction>),
            });

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // eslint-disable-next-line rulesdir/no-default-id-values
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // The result should be 'error' because there is at least one IOU action associated with a transaction that has a violation.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            const report = Object.values(mockData.reports)?.at(0);
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;

            await Onyx.multiSet({
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                session,
            });

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // eslint-disable-next-line rulesdir/no-default-id-values
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoadReportID', () => {
        it('Should return "error"', async () => {
            const transactionViolations = mockData.transactionViolations;
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                ...(transactionViolations as OnyxCollection<TransactionViolations>),
                ...(transactions as OnyxCollection<Transaction>),
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // The result should be '4286515777714555' as it is the reportID associated with the violation.
            expect(result).toBe('4286515777714555');
        });

        it('Should return "undefined"', async () => {
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;

            await Onyx.multiSet({
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                session,
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoad', () => {
        it('Should return reportID which has "error"', async () => {
            const transactionViolations = mockData.transactionViolations;
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                ...(transactionViolations as OnyxCollection<TransactionViolations>),
                ...(transactions as OnyxCollection<Transaction>),
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // The result should be 'error' due to violation present in the reports.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            const reports = mockData.reports;
            const session = mockData.session;
            const reportActions = mockData.reportActions;

            await Onyx.multiSet({
                ...(reports as ReportCollectionDataSet),
                ...(reportActions as OnyxCollection<ReportActions>),
                session,
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });
});
