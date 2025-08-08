import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getBrickRoadForPolicy, getChatTabBrickRoad, getChatTabBrickRoadReportID} from '@libs/WorkspacesSettingsUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportAttributesDerivedValue, Transaction, TransactionViolations} from '@src/types/onyx';
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
            // Given mock data for reports, transaction violations, sessions, and report actions.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getBrickRoadForPolicy with a reportID
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // The result should be 'error' because there is at least one IOU action associated with a transaction that has a violation.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            // Given mock data for reports, sessions, and report actions. Note: Transaction data is intentionally excluded.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getBrickRoadForPolicy with a reportID
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoadReportID', () => {
        it('Should return "error"', async () => {
            // Given mock data for reports, transaction violations, sessions, and report actions.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getChatTabBrickRoadReportID with reportIDs
            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // The result should be '4286515777714555'.
            expect(result).toBe('4286515777714555');
        });

        it('Should return "undefined"', async () => {
            // Given mock data for reports, sessions, and report actions. Note: Transaction data is intentionally excluded.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getChatTabBrickRoadReportID with reportIDs
            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoad', () => {
        it('Should return reportID which has "error"', async () => {
            // Given mock data for reports, transaction violations, sessions, and report actions.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getChatTabBrickRoad with reportIDs
            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // The result should be 'error'.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            // Given mock data for reports, sessions, and report actions. Note: Transaction data is intentionally excluded.
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
            const reportAttributes = await new Promise<ReportAttributesDerivedValue | undefined>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
                    callback: resolve,
                });
            });

            // When calling getChatTabBrickRoad with reportIDs
            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });
});
