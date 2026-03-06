import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportTransactionsCollection from '../../src/hooks/useReportTransactionsCollection';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {Transaction} from '../../src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '../../src/types/onyx/DerivedValues';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getReportTransactionsAndViolations = (reportID: string, transaction: Transaction): ReportTransactionsAndViolationsDerivedValue => ({
    [reportID]: {
        transactions: {
            [transaction.transactionID]: transaction,
        },
        violations: {},
    },
});

describe('useReportTransactionsCollection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns transactions for the requested report ID', async () => {
        const transaction = createRandomTransaction(1);
        const reportID = '1';
        const reportTransactionsAndViolations = getReportTransactionsAndViolations(reportID, transaction);

        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, reportTransactionsAndViolations);

        const {result} = renderHook(() => useReportTransactionsCollection(reportID));

        expect(result.current).toEqual(reportTransactionsAndViolations[reportID].transactions);
    });

    it('returns an empty object when reportID is missing', async () => {
        const transaction = createRandomTransaction(1);
        const reportID = '1';
        const reportTransactionsAndViolations = getReportTransactionsAndViolations(reportID, transaction);

        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, reportTransactionsAndViolations);

        const {result} = renderHook(() => useReportTransactionsCollection());

        expect(result.current).toEqual({});
    });

    it('returns an empty object when report does not have transactions', async () => {
        const transaction = createRandomTransaction(1);
        const reportID = '1';
        const reportTransactionsAndViolations = getReportTransactionsAndViolations(reportID, transaction);

        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, reportTransactionsAndViolations);

        const {result} = renderHook(() => useReportTransactionsCollection('999'));

        expect(result.current).toEqual({});
    });
});
