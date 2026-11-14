import {act, renderHook} from '@testing-library/react-native';

import useReportApprovalWarningData from '@hooks/useReportApprovalWarningData';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolations} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({__esModule: true, default: jest.fn()}));

const REPORT_ID = '1001';
const transaction = createMock<Transaction>({transactionID: '1', reportID: REPORT_ID, merchant: 'Merchant', amount: 1000, currency: 'USD'});
const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}` as const;
const violations: TransactionViolations = [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING}];
const mockedUseTransactionsAndViolationsForReport = jest.mocked(useTransactionsAndViolationsForReport);

describe('useReportApprovalWarningData', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        await Onyx.clear();
        mockedUseTransactionsAndViolationsForReport.mockReturnValue({transactions: {}, violations: {}, isLoaded: true});
    });

    it('keeps snapshot-only warnings until an authoritative live clear arrives', async () => {
        // Given an unopened Search expense with no corresponding live violation entry
        const {result} = renderHook(() => useReportApprovalWarningData(REPORT_ID, [transaction], {[violationKey]: violations}));
        await act(waitForBatchedUpdates);
        expect(result.current.transactions).toEqual([transaction]);
        expect(result.current.violations?.[violationKey]).toEqual(violations);

        // When live Onyx clears the warning without hydrating the transaction
        await act(async () => {
            await Onyx.set(violationKey, []);
        });

        // Then stale snapshot data cannot resurrect the warning
        expect(result.current.violations?.[violationKey]).toEqual([]);
        expect(result.current.liveViolations?.[violationKey]).toEqual([]);
        expect(result.current.liveTransactions).toEqual([]);
    });

    it('keeps raw approval inputs separate from filtered submit and badge data', async () => {
        // Given a hydrated expense whose visible submit warnings differ from its raw live violations
        const liveTransaction = {...transaction, amount: 2000};
        const filteredViolations = {[violationKey]: []};
        mockedUseTransactionsAndViolationsForReport.mockReturnValue({
            transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: liveTransaction},
            violations: filteredViolations,
            isLoaded: true,
        });
        await Onyx.set(violationKey, violations);

        // When the composed hook resolves both consumers' data
        const {result} = renderHook(() => useReportApprovalWarningData(REPORT_ID, [transaction], {}));
        await act(waitForBatchedUpdates);

        // Then live transaction values win, without substituting filtered arrays for authoritative raw entries
        expect(result.current.transactions).toEqual([liveTransaction]);
        expect(result.current.liveTransactions).toEqual([liveTransaction]);
        expect(result.current.violations?.[violationKey]).toEqual(violations);
        expect(result.current.liveViolations?.[violationKey]).toEqual(violations);
        expect(result.current.filteredLiveViolations).toEqual(filteredViolations);
    });
});
