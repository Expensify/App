/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {SelectedTransactionInfo} from '@components/Search/types';
import {bulkDeleteReports} from '@libs/actions/Search';
import {deleteAppReport} from '@userActions/Report';
import CONST from '@src/CONST';

jest.mock('@userActions/Report', () => ({
    deleteAppReport: jest.fn(),
}));

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

describe('bulkDeleteReports', () => {
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
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
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
                report_456: {
                    reportID: 'report_456',
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
            bulkDeleteReports(hash, selectedTransactions, currentUserEmail, transactions, transactionsViolations, {});

            // Should call deleteAppReport for each empty report
            expect(deleteAppReport).toHaveBeenCalledTimes(2);
            expect(deleteAppReport).toHaveBeenCalledWith('report_123', currentUserEmail, transactions, transactionsViolations, {});
            expect(deleteAppReport).toHaveBeenCalledWith('report_456', currentUserEmail, transactions, transactionsViolations, {});
        });

        it('should handle mixed selection of empty reports and transactions', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
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

            const currentUserEmail = '';
            const transactions = {};
            const transactionsViolations = {};
            bulkDeleteReports(hash, selectedTransactions, currentUserEmail, transactions, transactionsViolations, {});

            // Should call deleteAppReport for empty report
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith('report_123', currentUserEmail, transactions, transactionsViolations, {});
        });

        it('should not delete reports when no empty reports are selected', () => {
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

            bulkDeleteReports(hash, selectedTransactions, '', {}, {}, {});

            // Should not call deleteAppReport
            expect(deleteAppReport).not.toHaveBeenCalled();
        });

        it('should handle empty selection gracefully', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {};

            bulkDeleteReports(hash, selectedTransactions, '', {}, {}, {});

            // Should not call any deletion functions
            expect(deleteAppReport).not.toHaveBeenCalled();
        });

        it('should only delete reports where key matches reportID for VIEW action', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
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
                    reportID: 'report_456',
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
            bulkDeleteReports(hash, selectedTransactions, currentUserEmail, transactions, transactionsViolations, {});

            // Should only call deleteAppReport for the first report where key === reportID
            expect(deleteAppReport).toHaveBeenCalledTimes(1);
            expect(deleteAppReport).toHaveBeenCalledWith('report_123', currentUserEmail, transactions, transactionsViolations, {});
            expect(deleteAppReport).not.toHaveBeenCalledWith('report_456', currentUserEmail, transactions, transactionsViolations);
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

            bulkDeleteReports(hash, selectedTransactions, '', {}, {}, {});

            // Should not call deleteAppReport for transactions
            expect(deleteAppReport).not.toHaveBeenCalled();
        });
    });
});
