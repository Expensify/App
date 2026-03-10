/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {SelectedTransactionInfo} from '@components/Search/types';
import {bulkDeleteReports} from '@libs/actions/Search';
import {write} from '@libs/API';
import {deleteAppReport} from '@userActions/Report';
import CONST from '@src/CONST';
import {WRITE_COMMANDS} from '@src/libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {createRandomReport} from '../../utils/collections/reports';

jest.mock('@userActions/Report', () => ({
    deleteAppReport: jest.fn(),
}));

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

describe('bulkDeleteReports', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Empty Report Deletion', () => {
        it('should delete empty reports when selected', () => {
            const hash = 12345;
            const reports = {
                report_123: createRandomReport(123, undefined),
                report_456: createRandomReport(456, undefined),
            };
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                123: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    currency: 'USD',
                },
                456: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 0,
                    currency: 'USD',
                },
            };

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(reports, undefined, hash, selectedTransactions, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should call deleteAppReport for each empty report
            expect(deleteAppReport).toHaveBeenCalledTimes(2);
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_123, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_456, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});
        });

        it('should handle mixed selection of empty reports and transactions', () => {
            const hash = 12345;
            const reports = {
                report_123: createRandomReport(123, undefined),
                report_456: createRandomReport(456, undefined),
            };
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                123: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    currency: 'USD',
                },
                transaction_789: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    currency: 'USD',
                },
            };

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(reports, undefined, hash, selectedTransactions, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should call deleteAppReport for empty report
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_123, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});
        });

        it('should not delete reports when no empty reports are selected', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    currency: 'USD',
                },
            };

            bulkDeleteReports(undefined, undefined, hash, selectedTransactions, '', 1, {}, {}, {});

            // Should not call deleteAppReport
            expect(deleteAppReport).not.toHaveBeenCalled();
        });

        it('should handle empty selection gracefully', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {};

            bulkDeleteReports(undefined, undefined, hash, selectedTransactions, '', 1, {}, {}, {});

            // Should not call any deletion functions
            expect(deleteAppReport).not.toHaveBeenCalled();
        });

        it('should only delete reports where key matches reportID for VIEW action', () => {
            const hash = 12345;
            const reports = {
                report_123: createRandomReport(123, undefined),
                report_456: createRandomReport(456, undefined),
            };
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                123: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    currency: 'USD',
                },
                different_key: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 0,
                    currency: 'USD',
                },
            };

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(reports, undefined, hash, selectedTransactions, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should only call deleteAppReport for the first report where key === reportID
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_123, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});
            expect(deleteAppReport).not.toHaveBeenCalledWith(reports.report_456, undefined, currentUserEmail, 1, transactions, transactionsViolations);
        });
    });

    describe('Transaction Deletion', () => {
        it('should handle transaction deletion when transactions are selected', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: 'report_456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: 'report_456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    currency: 'USD',
                },
            };

            bulkDeleteReports(undefined, undefined, hash, selectedTransactions, '', 1, {}, {}, {});

            // Should not call deleteAppReport for transactions
            expect(deleteAppReport).not.toHaveBeenCalled();
        });

        it('should exclude transactions whose reportID is in the list of reports being deleted', () => {
            const hash = 12345;
            const reports = {
                report_123: createRandomReport(123, undefined),
            };
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                // This is an empty report (key === reportID), should be deleted
                123: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    currency: 'USD',
                },
                // Transaction belonging to report_123 - should NOT be deleted separately since report is being deleted
                transaction_789: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 1000,
                    currency: 'USD',
                },
                // Transaction belonging to a different report - should be deleted
                transaction_456: {
                    reportID: '456',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    currency: 'USD',
                },
            };

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(reports, undefined, hash, selectedTransactions, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should call deleteAppReport for the report
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_123, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should call API.write with DELETE_MONEY_REQUEST_ON_SEARCH only for transaction_456 (not transaction_789 since its report is being deleted)
            expect(write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH,
                expect.objectContaining({
                    hash,
                    transactionIDList: ['transaction_456'],
                }),
                expect.any(Object),
            );
        });

        it('should delete all transactions when none belong to reports being deleted', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: '999',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy999',
                    amount: 1000,
                    currency: 'USD',
                },
                transaction_456: {
                    reportID: '888',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy888',
                    amount: 500,
                    currency: 'USD',
                },
            };

            bulkDeleteReports(undefined, undefined, hash, selectedTransactions, '', 1, {}, {}, {});

            // Should not call deleteAppReport
            expect(deleteAppReport).not.toHaveBeenCalled();

            // Should call API.write with DELETE_MONEY_REQUEST_ON_SEARCH with all transaction IDs
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH,
                expect.objectContaining({
                    hash,
                    transactionIDList: expect.arrayContaining(['transaction_789', 'transaction_456']),
                }),
                expect.any(Object),
            );
        });

        it('should not call deleteMoneyRequestOnSearch when all transactions belong to reports being deleted', () => {
            const hash = 12345;
            const reports = {
                report_123: createRandomReport(123, undefined),
            };
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                // This is an empty report (key === reportID), should be deleted
                123: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    currency: 'USD',
                },
                // Transaction belonging to report_123 - should NOT be deleted separately since report is being deleted
                transaction_789: {
                    reportID: '123',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 1000,
                    currency: 'USD',
                },
            };

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(reports, undefined, hash, selectedTransactions, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should call deleteAppReport for the report
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith(reports.report_123, undefined, currentUserEmail, 1, transactions, transactionsViolations, {});

            // Should NOT call API.write with DELETE_MONEY_REQUEST_ON_SEARCH since all transactions belong to the report being deleted
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(write).not.toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH, expect.anything(), expect.anything());
        });

        it('should handle transactions with no reportID', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: '',
                    isFromOneTransactionReport: false,
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canSplit: false,
                    canReject: false,
                    hasBeenSplit: false,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 1000,
                    currency: 'USD',
                },
            };

            bulkDeleteReports(undefined, undefined, hash, selectedTransactions, '', 1, {}, {}, {});

            // Should call API.write with DELETE_MONEY_REQUEST_ON_SEARCH for transaction with no reportID
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH,
                expect.objectContaining({
                    hash,
                    transactionIDList: ['transaction_789'],
                }),
                expect.any(Object),
            );
        });
    });
});
