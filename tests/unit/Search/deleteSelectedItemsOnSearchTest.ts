/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {SelectedTransactionInfo} from '@components/Search/types';
import {deleteSelectedItemsOnSearch} from '@libs/actions/Search';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

// Mock the Report actions
jest.mock('@userActions/Report', () => ({
    deleteAppReport: jest.fn(),
}));

// Mock the API
jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

describe('deleteSelectedItemsOnSearch', () => {
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
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                report_456: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
            };

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should call deleteAppReport for each empty report
            expect(Report.deleteAppReport).toHaveBeenCalledTimes(2);
            expect(Report.deleteAppReport).toHaveBeenCalledWith('report_123');
            expect(Report.deleteAppReport).toHaveBeenCalledWith('report_456');
        });

        it('should handle mixed selection of empty reports and transactions', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                transaction_789: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    convertedAmount: 1000,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    convertedAmount: 500,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
            };

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should call deleteAppReport for empty report
            expect(Report.deleteAppReport).toHaveBeenCalledTimes(1);
            expect(Report.deleteAppReport).toHaveBeenCalledWith('report_123');
        });

        it('should not delete reports when no empty reports are selected', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    convertedAmount: 1000,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    convertedAmount: 500,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
            };

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should not call deleteAppReport
            expect(Report.deleteAppReport).not.toHaveBeenCalled();
        });

        it('should handle empty selection gracefully', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {};

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should not call any deletion functions
            expect(Report.deleteAppReport).not.toHaveBeenCalled();
        });

        it('should only delete reports where key matches reportID for VIEW action', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                different_key: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
            };

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should only call deleteAppReport for the first report where key === reportID
            expect(Report.deleteAppReport).toHaveBeenCalledTimes(1);
            expect(Report.deleteAppReport).toHaveBeenCalledWith('report_123');
            expect(Report.deleteAppReport).not.toHaveBeenCalledWith('report_456');
        });
    });

    describe('Transaction Deletion', () => {
        it('should handle transaction deletion when transactions are selected', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                transaction_789: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 1000,
                    convertedAmount: 1000,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                transaction_101: {
                    reportID: 'report_456',
                    action: CONST.SEARCH.ACTION_TYPES.REVIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: true,
                    canChangeReport: true,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy456',
                    amount: 500,
                    convertedAmount: 500,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
            };

            deleteSelectedItemsOnSearch(hash, selectedTransactions);

            // Should not call deleteAppReport for transactions
            expect(Report.deleteAppReport).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null/undefined selectedTransactions', () => {
            const hash = 12345;

            // Test with null - function currently throws TypeError, which is expected behavior
            expect(() => {
                deleteSelectedItemsOnSearch(hash, null as unknown as Record<string, SelectedTransactionInfo>);
            }).toThrow('Cannot convert undefined or null to object');

            // Test with undefined - function currently throws TypeError, which is expected behavior
            expect(() => {
                deleteSelectedItemsOnSearch(hash, undefined as unknown as Record<string, SelectedTransactionInfo>);
            }).toThrow('Cannot convert undefined or null to object');
        });

        it('should handle malformed selectedTransaction entries', () => {
            const hash = 12345;
            const selectedTransactions: Record<string, SelectedTransactionInfo> = {
                report_123: {
                    reportID: 'report_123',
                    action: CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: true,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: 'policy123',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currency: 'USD',
                },
                malformed_entry: {
                    reportID: '',
                    action: undefined as unknown as typeof CONST.SEARCH.ACTION_TYPES.VIEW,
                    isSelected: true,
                    canDelete: false,
                    canHold: false,
                    canChangeReport: false,
                    isHeld: false,
                    canUnhold: false,
                    policyID: '',
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: '',
                    currency: '',
                },
            };

            expect(() => {
                deleteSelectedItemsOnSearch(hash, selectedTransactions);
            }).not.toThrow();

            // Should still process valid entries
            expect(Report.deleteAppReport).toHaveBeenCalledWith('report_123');
        });
    });
});
