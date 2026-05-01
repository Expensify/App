import {addOptimisticSmartScanModifiedAmountViolation} from '@libs/actions/IOU/UpdateMoneyRequest';
import CONST from '@src/CONST';
import type {Transaction, TransactionViolation} from '@src/types/onyx';

/**
 * Builds a minimal scan transaction for testing.
 * - receipt.state = SCAN_COMPLETE so didReceiptScanSucceed() returns true
 */
function buildScannedTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: '1',
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        merchant: 'Test',
        created: '2026-01-01',
        reportID: '1',
        receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE},
        modifiedAmount: 1000,
        ...overrides,
    } as Transaction;
}

const existingViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.MISSING_CATEGORY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
};

const expectedSmartScanViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
    type: CONST.VIOLATION_TYPES.NOTICE,
    showInReview: true,
    data: {
        type: CONST.MODIFIED_AMOUNT_VIOLATION_DATA.SMARTSCAN,
    },
};

describe('addOptimisticSmartScanModifiedAmountViolation', () => {
    it('should add modifiedAmount violation when edited amount exceeds scanned amount', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: [existingViolation],
            hasModifiedAmount: true,
        });

        expect(result).toHaveLength(2);
        expect(result).toContainEqual(existingViolation);
        expect(result).toContainEqual(expectedSmartScanViolation);
    });

    it('should return original violations when edited amount is less than or equal to scanned amount', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 2000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 1000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when edited amount equals scanned amount', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 1000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when hasModifiedAmount is false', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: false,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when receipt scan did not succeed', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000, receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when receipt is still being scanned', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000, receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING}});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when receipt is in SCAN_READY state', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000, receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_READY}});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when transaction is undefined', () => {
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction: undefined,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should return original violations when scanned amount is zero', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 0});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const violations = [existingViolation];

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: violations,
            hasModifiedAmount: true,
        });

        expect(result).toBe(violations);
    });

    it('should replace existing smartscan modifiedAmount violation instead of duplicating', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 3000});
        const existingSmartScanViolation: TransactionViolation = {
            name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
            type: CONST.VIOLATION_TYPES.NOTICE,
            showInReview: true,
            data: {type: CONST.MODIFIED_AMOUNT_VIOLATION_DATA.SMARTSCAN},
        };

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: [existingViolation, existingSmartScanViolation],
            hasModifiedAmount: true,
        });

        const modifiedAmountViolations = result.filter((v) => v.name === CONST.VIOLATIONS.MODIFIED_AMOUNT);
        expect(modifiedAmountViolations).toHaveLength(1);
        expect(result).toHaveLength(2);
    });

    it('should preserve non-smartscan modifiedAmount violations (e.g. distance type)', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});
        const distanceModifiedAmountViolation: TransactionViolation = {
            name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
            type: CONST.VIOLATION_TYPES.NOTICE,
            data: {type: CONST.MODIFIED_AMOUNT_VIOLATION_DATA.DISTANCE},
        };

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: [existingViolation, distanceModifiedAmountViolation],
            hasModifiedAmount: true,
        });

        const modifiedAmountViolations = result.filter((v) => v.name === CONST.VIOLATIONS.MODIFIED_AMOUNT);
        expect(modifiedAmountViolations).toHaveLength(2);
        expect(result).toContainEqual(distanceModifiedAmountViolation);
        expect(result).toContainEqual(expectedSmartScanViolation);
    });

    it('should handle negative amounts correctly (uses absolute values)', () => {
        const transaction = buildScannedTransaction({modifiedAmount: -1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: -2000});

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: [],
            hasModifiedAmount: true,
        });

        expect(result).toHaveLength(1);
        expect(result).toContainEqual(expectedSmartScanViolation);
    });

    it('should work with empty existing violations array', () => {
        const transaction = buildScannedTransaction({modifiedAmount: 1000});
        const updatedTransaction = buildScannedTransaction({modifiedAmount: 2000});

        const result = addOptimisticSmartScanModifiedAmountViolation({
            transaction,
            updatedTransaction,
            transactionViolations: [],
            hasModifiedAmount: true,
        });

        expect(result).toHaveLength(1);
        expect(result).toContainEqual(expectedSmartScanViolation);
    });
});
