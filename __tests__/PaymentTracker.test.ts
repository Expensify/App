import {waitFor} from '@testing-library/react-native';
import PaymentTracker from '@src/libs/PaymentTracker';
import * as API from '@src/libs/API';
import * as ReimbursementAccountUtils from '@src/libs/ReimbursementAccountUtils';
import CONST from '@src/CONST';

jest.mock('@src/libs/API');
jest.mock('@src/libs/ReimbursementAccountUtils');

describe('PaymentTracker', () => {
    let paymentTracker: PaymentTracker;

    beforeEach(() => {
        paymentTracker = new PaymentTracker();
        jest.clearAllMocks();
    });

    afterEach(() => {
        paymentTracker.cleanup();
    });

    describe('Reimbursement Account Payments', () => {
        it('should track payment made from reimbursement account', async () => {
            const mockPayment = {
                invoiceID: 'inv_123456',
                amount: 5000,
                currency: 'USD',
                paymentMethod: CONST.PAYMENT_METHOD.REIMBURSEMENT_ACCOUNT,
                timestamp: Date.now(),
            };

            jest.spyOn(ReimbursementAccountUtils, 'isPaymentFromReimbursementAccount').mockReturnValue(true);
            jest.spyOn(API, 'write').mockResolvedValue({});

            const result = await paymentTracker.trackPayment(mockPayment);

            expect(result.success).toBe(true);
            expect(API.write).toHaveBeenCalledWith('UpdatePaymentSource', {
                invoiceID: mockPayment.invoiceID,
                paymentSource: CONST.PAYMENT_SOURCE.REIMBURSEMENT_ACCOUNT,
                amount: mockPayment.amount,
            });
        });

        it('should handle reimbursement account payment validation errors', async () => {
            const mockPayment = {
                invoiceID: 'inv_invalid',
                amount: -100,
                currency: 'USD',
                paymentMethod: CONST.PAYMENT_METHOD.REIMBURSEMENT_ACCOUNT,
            };

            jest.spyOn(ReimbursementAccountUtils, 'isPaymentFromReimbursementAccount').mockReturnValue(true);
            jest.spyOn(API, 'write').mockRejectedValue(new Error('Invalid payment amount'));

            const result = await paymentTracker.trackPayment(mockPayment);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid payment amount');
        });
    });

    describe('External Payment Detection', () => {
        it('should detect payments marked as paid outside Expensify', async () => {
            const mockInvoice = {
                id: 'inv_789012',
                status: CONST.INVOICE_STATUS.PAID,
                lastModified: Date.now(),
                paymentSource: null,
            };

            jest.spyOn(API, 'read').mockResolvedValue({
                invoice: mockInvoice,
            });

            const isExternalPayment = await paymentTracker.checkForExternalPayment('inv_789012');

            expect(isExternalPayment).toBe(true);
            expect(API.read).toHaveBeenCalledWith('GetInvoiceStatus', {
                invoiceID: 'inv_789012',
            });
        });

        it('should not flag internal payments as external', async () => {
            const mockInvoice = {
                id: 'inv_345678',
                status: CONST.INVOICE_STATUS.PAID,
                lastModified: Date.now(),
                paymentSource: CONST.PAYMENT_SOURCE.REIMBURSEMENT_ACCOUNT,
            };

            jest.spyOn(API, 'read').mockResolvedValue({
                invoice: mockInvoice,
            });

            const isExternalPayment = await paymentTracker.checkForExternalPayment('inv_345678');

            expect(isExternalPayment).toBe(false);
        });
    });

    describe('Payment Status Updates', () => {
        it('should update payment status correctly', async () => {
            const invoiceID = 'inv_status_test';
            const newStatus = CONST.INVOICE_STATUS.PROCESSING;

            jest.spyOn(API, 'write').mockResolvedValue({
                success: true,
            });

            await paymentTracker.updatePaymentStatus(invoiceID, newStatus);

            expect(API.write).toHaveBeenCalledWith('UpdateInvoiceStatus', {
                invoiceID,
                status: newStatus,
                timestamp: expect.any(Number),
            });
        });

        it('should handle concurrent status updates', async () => {
            const invoiceID = 'inv_concurrent';
            const statuses = [
                CONST.INVOICE_STATUS.PROCESSING,
                CONST.INVOICE_STATUS.PAID,
                CONST.INVOICE_STATUS.COMPLETED,
            ];

            jest.spyOn(API, 'write').mockResolvedValue({success: true});

            const updatePromises = statuses.map(status =>
                paymentTracker.updatePaymentStatus(invoiceID, status)
            );

            await Promise.all(updatePromises);

            expect(API.write).toHaveBeenCalledTimes(3);
        });
    });

    describe('Error Handling', () => {
        it('should handle API timeout errors gracefully', async () => {
            const mockPayment = {
                invoiceID: 'inv_timeout',
                amount: 2500,
                currency: 'USD',
                paymentMethod: CONST.PAYMENT_METHOD.EXTERNAL,
            };

            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';

            jest.spyOn(API, 'write').mockRejectedValue(timeoutError);

            const result = await paymentTracker.trackPayment(mockPayment);

            expect(result.success).toBe(false);
            expect(result.error).toContain('timeout');
            expect(result.retryable).toBe(true);
        });

        it('should handle network connectivity issues', async () => {
            const networkError = new Error('Network unavailable');
            networkError.name = 'NetworkError';

            jest.spyOn(API, 'read').mockRejectedValue(networkError);

            const result = await paymentTracker.checkForExternalPayment('inv_network_test');

            expect(result).toBe(false);
        });

        it('should retry failed payment tracking with exponential backoff', async () => {
            const mockPayment = {
                invoiceID: 'inv_retry_test',
                amount: 1000,
                currency: 'USD',
                paymentMethod: CONST.PAYMENT_METHOD.REIMBURSEMENT_ACCOUNT,
            };

            jest.spyOn(API, 'write')
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockResolvedValue({success: true});

            const result = await paymentTracker.trackPaymentWithRetry(mockPayment, {
                maxRetries: 3,
                baseDelay: 100,
            });

            expect(result.success).toBe(true);
            expect(API.write).toHaveBeenCalledTimes(3);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle payment mismatch between internal tracking and external status', async () => {
            const invoiceID = 'inv_mismatch_test';
            const internalPayment = {
                invoiceID,
                amount: 3000,
                currency: 'USD',
                paymentMethod: CONST.PAYMENT_METHOD.REIMBURSEMENT_ACCOUNT,
                timestamp: Date.now() - 60000,
            };

            jest.spyOn(paymentTracker, 'getInternalPaymentRecord').mockResolvedValue(internalPayment);
            jest.spyOn(API, 'read').mockResolvedValue({
                invoice: {
                    id: invoiceID,
                    status: CONST.INVOICE_STATUS.PAID,
                    paymentSource: null,
                    lastModified: Date.now(),
                },
            });

            const mismatch = await paymentTracker.detectPaymentMismatch(invoiceID);

            expect(mismatch).toBe(true);
            expect(mismatch.details).toEqual({
                internalPayment: true,
                externalPayment: true,
                conflictType: 'PAYMENT_SOURCE_MISMATCH',
            });
        });

        it('should synchronize payment data after detecting discrepancy', async () => {
            const invoiceID = 'inv_sync_test';

            jest.spyOn(API, 'write').mockResolvedValue({success: true});

            await paymentTracker.synchronizePaymentData(invoiceID);

            expect(API.write).toHaveBeenCalledWith('SynchronizeInvoicePayment', {
                invoiceID,
                forceRefresh: true,
                validatePaymentSource: true,
            });
        });
    });

    describe('Performance and Memory Management', () => {
        it('should clean up tracking resources after completion', async () => {
            const invoiceIDs = Array.from({length: 50}, (_, i) => `inv_${i}`);

            for (const invoiceID of invoiceIDs) {
                await paymentTracker.trackPayment({
                    invoiceID,
                    amount: 1000,
                    currency: 'USD',
                    paymentMethod: CONST.PAYMENT_METHOD.EXTERNAL,
                });
            }

            const initialMemoryUsage = paymentTracker.getActiveTrackers().length;

            await paymentTracker.cleanup();

            const finalMemoryUsage = paymentTracker.getActiveTrackers().length;

            expect(finalMemoryUsage).toBeLessThan(initialMemoryUsage);
            expect(finalMemoryUsage).toBe(0);
        });

        it('should handle high volume payment tracking efficiently', async () => {
            const startTime = Date.now();
            const paymentPromises = Array.from({length: 100}, (_, i) =>
                paymentTracker.trackPayment({
                    invoiceID: `inv_volume_${i}`,
                    amount: Math.floor(Math.random() * 10000),
                    currency: 'USD',
                    paymentMethod: CONST.PAYMENT_METHOD.REIMBURSEMENT_ACCOUNT,
                })
            );

            jest.spyOn(API, 'write').mockResolvedValue({success: true});

            const results = await Promise.allSettled(paymentPromises);
            const endTime = Date.now();

            const successfulResults = results.filter(r => r.status === 'fulfilled');

            expect(successfulResults.length).toBeGreaterThan(90);
            expect(endTime - startTime).toBeLessThan(5000);
        });
    });
});
