import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getBrickRoadForPolicy} from '@libs/WorkspacesSettingsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import mockData from './WorkspaceSettingsUtilsTest.json';

describe('WorkspacesSettingsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
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

            // When calling getBrickRoadForPolicy with a report and report actions
            const result = getBrickRoadForPolicy(report as Report, reportActions as OnyxCollection<ReportActions>);

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

            // When calling getBrickRoadForPolicy with a report and report actions
            const result = getBrickRoadForPolicy(report as Report, reportActions as OnyxCollection<ReportActions>);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });
});
