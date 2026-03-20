import {jest} from '@jest/globals';
import * as PaymentTracker from '../src/libs/PaymentTracker';
import * as ReportUtils from '../src/libs/ReportUtils';
import * as PolicyUtils from '../src/libs/PolicyUtils';
import type {Report, Policy, Transaction} from '../src/types/onyx';

jest.mock('../src/libs/ReportUtils');
jest.mock('../src/libs/PolicyUtils');

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;
const mockPolicyUtils = PolicyUtils as jest.Mocked<typeof PolicyUtils>;

describe('PaymentTracker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isPaymentFromReimbursementAccount', () => {
        const mockPolicy: Policy = {
            id: 'policy123',
            name: 'Test Policy',
            type: 'team',
            role: 'admin',
            outputCurrency: 'USD',
        };

        const mockReport: Report = {
            reportID: 'report123',
            policyID: 'policy123',
            chatType: 'invoice',
            type: 'invoice',
            total: 10000,
        };

        it('should return true when payment comes from policy reimbursement account', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('1234567890');
            mockReportUtils.getReport.mockReturnValue(mockReport);

            const paymentData = {
                accountNumber: '1234567890',
                reportID: 'report123',
                amount: 10000,
            };

            const result = PaymentTracker.isPaymentFromReimbursementAccount(paymentData, mockPolicy);
            expect(result).toBe(true);
        });

        it('should return false when payment comes from different account', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('1234567890');
            mockReportUtils.getReport.mockReturnValue(mockReport);

            const paymentData = {
                accountNumber: '9876543210',
                reportID: 'report123',
                amount: 10000,
            };

            const result = PaymentTracker.isPaymentFromReimbursementAccount(paymentData, mockPolicy);
            expect(result).toBe(false);
        });

        it('should return false when policy has no reimbursement account', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('');
            mockReportUtils.getReport.mockReturnValue(mockReport);

            const paymentData = {
                accountNumber: '1234567890',
                reportID: 'report123',
                amount: 10000,
            };

            const result = PaymentTracker.isPaymentFromReimbursementAccount(paymentData, mockPolicy);
            expect(result).toBe(false);
        });

        it('should handle null policy gracefully', () => {
            const paymentData = {
                accountNumber: '1234567890',
                reportID: 'report123',
                amount: 10000,
            };

            const result = PaymentTracker.isPaymentFromReimbursementAccount(paymentData, null);
            expect(result).toBe(false);
        });
    });

    describe('detectExternalPayment', () => {
        const mockTransaction: Transaction = {
            transactionID: 'txn123',
            amount: 10000,
            currency: 'USD',
            reportID: 'report123',
            merchant: 'Test Merchant',
        };

        it('should detect external payment correctly', () => {
            const paymentMetadata = {
                source: 'external_bank',
                timestamp: Date.now(),
                reference: 'ext_pay_123',
            };

            mockReportUtils.isInvoiceReport.mockReturnValue(true);

            const result = PaymentTracker.detectExternalPayment(mockTransaction, paymentMetadata);
            expect(result).toEqual({
                isExternal: true,
                source: 'external_bank',
                shouldMarkAsPaid: true,
            });
        });

        it('should not mark non-invoice reports as externally paid', () => {
            const paymentMetadata = {
                source: 'external_bank',
                timestamp: Date.now(),
                reference: 'ext_pay_123',
            };

            mockReportUtils.isInvoiceReport.mockReturnValue(false);

            const result = PaymentTracker.detectExternalPayment(mockTransaction, paymentMetadata);
            expect(result).toEqual({
                isExternal: true,
                source: 'external_bank',
                shouldMarkAsPaid: false,
            });
        });

        it('should handle internal payments', () => {
            const paymentMetadata = {
                source: 'expensify_card',
                timestamp: Date.now(),
                reference: 'exp_pay_123',
            };

            const result = PaymentTracker.detectExternalPayment(mockTransaction, paymentMetadata);
            expect(result).toEqual({
                isExternal: false,
                source: 'expensify_card',
                shouldMarkAsPaid: false,
            });
        });
    });

    describe('validatePaymentSource', () => {
        it('should validate reimbursement account payments', () => {
            const paymentData = {
                accountNumber: '1234567890',
                routingNumber: '021000021',
                accountType: 'checking',
            };

            const result = PaymentTracker.validatePaymentSource(paymentData);
            expect(result.isValid).toBe(true);
            expect(result.sourceType).toBe('reimbursement_account');
        });

        it('should validate external payment sources', () => {
            const paymentData = {
                accountNumber: '9876543210',
                routingNumber: '031000021',
                accountType: 'savings',
            };

            const result = PaymentTracker.validatePaymentSource(paymentData);
            expect(result.isValid).toBe(true);
            expect(result.sourceType).toBe('external_account');
        });

        it('should reject invalid payment data', () => {
            const paymentData = {
                accountNumber: '',
                routingNumber: 'invalid',
                accountType: 'unknown',
            };

            const result = PaymentTracker.validatePaymentSource(paymentData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid account number');
            expect(result.errors).toContain('Invalid routing number');
        });

        it('should handle missing payment data', () => {
            const result = PaymentTracker.validatePaymentSource(null);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Missing payment data');
        });
    });

    describe('processInvoicePayment', () => {
        const mockInvoiceReport: Report = {
            reportID: 'invoice123',
            policyID: 'policy123',
            chatType: 'invoice',
            type: 'invoice',
            total: 25000,
            stateNum: 2,
            statusNum: 2,
        };

        const mockPolicy: Policy = {
            id: 'policy123',
            name: 'Test Policy',
            type: 'team',
            role: 'admin',
            outputCurrency: 'USD',
        };

        it('should mark invoice as paid when payment from reimbursement account', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('1234567890');
            mockReportUtils.getReport.mockReturnValue(mockInvoiceReport);
            mockReportUtils.isInvoiceReport.mockReturnValue(true);

            const paymentData = {
                accountNumber: '1234567890',
                amount: 25000,
                reportID: 'invoice123',
                timestamp: Date.now(),
            };

            const result = PaymentTracker.processInvoicePayment(paymentData, mockPolicy);
            expect(result.shouldMarkAsPaid).toBe(true);
            expect(result.paymentSource).toBe('reimbursement_account');
            expect(result.isValidPayment).toBe(true);
        });

        it('should not mark invoice as paid when payment from external account', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('1234567890');
            mockReportUtils.getReport.mockReturnValue(mockInvoiceReport);
            mockReportUtils.isInvoiceReport.mockReturnValue(true);

            const paymentData = {
                accountNumber: '9876543210',
                amount: 25000,
                reportID: 'invoice123',
                timestamp: Date.now(),
            };

            const result = PaymentTracker.processInvoicePayment(paymentData, mockPolicy);
            expect(result.shouldMarkAsPaid).toBe(false);
            expect(result.paymentSource).toBe('external_account');
            expect(result.isValidPayment).toBe(true);
        });

        it('should handle amount mismatches', () => {
            mockPolicyUtils.getReimbursementAccountNumber.mockReturnValue('1234567890');
            mockReportUtils.getReport.mockReturnValue(mockInvoiceReport);
            mockReportUtils.isInvoiceReport.mockReturnValue(true);

            const paymentData = {
                accountNumber: '1234567890',
                amount: 15000,
                reportID: 'invoice123',
                timestamp: Date.now(),
            };

            const result = PaymentTracker.processInvoicePayment(paymentData, mockPolicy);
            expect(result.shouldMarkAsPaid).toBe(false);
            expect(result.isValidPayment).toBe(false);
            expect(result.errors).toContain('Payment amount does not match invoice total');
        });

        it('should reject payments for non-invoice reports', () => {
            const nonInvoiceReport = {...mockInvoiceReport, type: 'expense'};
            mockReportUtils.getReport.mockReturnValue(nonInvoiceReport);
            mockReportUtils.isInvoiceReport.mockReturnValue(false);

            const paymentData = {
                accountNumber: '1234567890',
                amount: 25000,
                reportID: 'invoice123',
                timestamp: Date.now(),
            };

            const result = PaymentTracker.processInvoicePayment(paymentData, mockPolicy);
            expect(result.shouldMarkAsPaid).toBe(false);
            expect(result.isValidPayment).toBe(false);
            expect(result.errors).toContain('Payment not applicable to non-invoice report');
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle malformed payment data gracefully', () => {
            const malformedData = {
                accountNumber: null,
                amount: 'invalid',
                reportID: undefined,
            };

            const result = PaymentTracker.validatePaymentSource(malformedData);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should handle network timeouts in payment detection', async () => {
            mockReportUtils.getReport.mockImplementation(() => {
                throw new Error('Network timeout');
            });

            const paymentData = {
                accountNumber: '1234567890',
                amount: 10000,
                reportID: 'report123',
                timestamp: Date.now(),
            };

            expect(() => {
                PaymentTracker.processInvoicePayment(paymentData, null);
            }).toThrow('Network timeout');
        });

        it('should handle concurrent payment processing', () => {
            const paymentData1 = {
                accountNumber: '1234567890',
                amount: 10000,
                reportID: 'report123',
                timestamp: Date.now(),
            };

            const paymentData2 = {
                accountNumber: '1234567890',
                amount: 10000,
                reportID: 'report123',
                timestamp: Date.now() + 1000,
            };

            mockReportUtils.getReport.mockReturnValue({
                reportID: 'report123',
                total: 10000,
                type: 'invoice',
            });

            const results = [paymentData1, paymentData2].map(data =>
                PaymentTracker.validatePaymentSource(data)
            );

            expect(results[0].isValid).toBe(true);
            expect(results[1].isValid).toBe(true);
        });
    });
});
