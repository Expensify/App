import {getPaymentHistoryRows} from '@libs/PaymentHistoryUtils';

import CONST from '@src/CONST';
import type {Purchase} from '@src/types/onyx/PurchaseList';

function createPurchase(purchaseID: number, created: string, message: Purchase['message'] = {}, amount = 1000): Purchase {
    return {
        purchaseID,
        created,
        amount,
        currency: CONST.CURRENCY.USD,
        message,
    };
}

describe('getPaymentHistoryRows', () => {
    it('lists one row per bill, newest first', () => {
        // Given bills from three different months, listed oldest first
        const purchaseList = [createPurchase(1, '2026-02-01'), createPurchase(2, '2026-08-01'), createPurchase(3, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR})];

        // When the table rows are built
        const rows = getPaymentHistoryRows(purchaseList);

        // Then each bill is kept and the newest month is first
        expect(rows.map((row) => row.purchaseID)).toEqual([2, 3, 1]);
        expect(rows.at(0)?.state).toBe(CONST.PAYMENT_HISTORY.STATE.PAID);
        expect(rows.at(1)?.state).toBe(CONST.PAYMENT_HISTORY.STATE.CLEARED);
    });

    it('folds a refund, dispute, or balance transfer onto the bill it changes', () => {
        // Given a bill that was later refunded, one that was disputed, and one whose balance moved
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(11, '2026-03-01'),
            createPurchase(12, '2026-04-01'),
            createPurchase(20, '2026-09-01', {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 10}),
            createPurchase(21, '2026-10-04', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 11}),
            createPurchase(22, '2026-11-04', {billingType: CONST.BILLING.TYPE_TRANSFER, fromPurchaseID: 12}),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(purchaseList);

        // Then the modifier purchases are not their own rows, and the bill carries that state
        expect(rows.map((row) => row.purchaseID)).toEqual([12, 11, 10]);
        expect(rows.map((row) => row.state)).toEqual([CONST.PAYMENT_HISTORY.STATE.BALANCE_TRANSFER, CONST.PAYMENT_HISTORY.STATE.DISPUTED, CONST.PAYMENT_HISTORY.STATE.REFUNDED]);
    });

    it('keeps the later change when a bill is both disputed and refunded', () => {
        // Given a bill that was disputed and then refunded
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 10}),
            createPurchase(21, '2026-04-01', {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 10}),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(purchaseList);

        // Then the refund replaces the dispute, because it happened later
        expect(rows).toHaveLength(1);
        expect(rows.at(0)?.state).toBe(CONST.PAYMENT_HISTORY.STATE.REFUNDED);
    });

    it('marks failed bills and shows tax only when it was charged', () => {
        // Given a failed bill that includes tax, a taxed bill for an exempt account, and a plain paid bill
        const purchaseList = [
            createPurchase(1, '2026-08-01', {billingType: CONST.BILLING.TYPE_FAILED_2018, billableAmount: 2700, salesTaxCharged: true}, 0),
            createPurchase(2, '2026-03-01', {salesTaxCharged: true, salesTaxExempt: true}),
            createPurchase(3, '2026-02-01', {salesTaxCharged: true}),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(purchaseList);

        // Then the failed bill uses the amount that was due, and tax is hidden for the exempt account
        const failed = rows.find((row) => row.purchaseID === 1);
        const exempt = rows.find((row) => row.purchaseID === 2);
        const taxed = rows.find((row) => row.purchaseID === 3);
        expect(failed?.state).toBe(CONST.PAYMENT_HISTORY.STATE.FAILED);
        expect(failed?.amount).toBe(2700);
        expect(failed?.showsTax).toBe(true);
        expect(exempt?.showsTax).toBe(false);
        expect(taxed?.showsTax).toBe(true);
    });

    it('counts each billed person once when they appear on more than one workspace', () => {
        // Given a bill whose actor lists repeat the same person across workspaces
        const purchaseList = [
            createPurchase(1, '2026-02-01', {
                billablePolicies: {
                    first: {actorList: 'ada@example.com,bob@example.com'},
                    second: {actorList: 'bob@example.com'},
                },
            }),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(purchaseList);

        // Then the repeated person is counted once
        expect(rows.at(0)?.activeUserCount).toBe(2);
    });
});
