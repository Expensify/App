import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {
    formatDate,
    getActiveUserAccountIDs,
    getBadgeText,
    getPaymentDetailsBadge,
    getPaymentHistoryRow,
    getPaymentHistoryRows,
    getReceiptFileName,
    getReceiptSource,
    isInvoiceBilling,
} from '@libs/PaymentHistoryUtils';

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

function toPurchases(purchaseList: Purchase[]): Record<string, Purchase> {
    return Object.fromEntries(purchaseList.map((purchase) => [String(purchase.purchaseID), purchase]));
}

describe('getPaymentHistoryRows', () => {
    it('lists one row per bill, newest first', () => {
        // Given bills from three different months, listed oldest first
        const purchaseList = [createPurchase(1, '2026-02-01'), createPurchase(2, '2026-08-01'), createPurchase(3, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR})];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

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
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then the modifier purchases are not their own rows, and the bill carries that state
        expect(rows.map((row) => row.purchaseID)).toEqual([12, 11, 10]);
        expect(rows.map((row) => row.state)).toEqual([CONST.PAYMENT_HISTORY.STATE.BALANCE_TRANSFER, CONST.PAYMENT_HISTORY.STATE.DISPUTED, CONST.PAYMENT_HISTORY.STATE.REFUNDED]);
    });

    it('folds a cleared payment onto the failed bill it pays', () => {
        // Given a failed bill that was paid on a later clear purchase
        const purchaseList = [
            createPurchase(10, '2026-02-01', {billingType: CONST.BILLING.TYPE_FAILED, billableAmount: 2700}, 0),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR, failedPurchaseID: 10}, 2700),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then the clear is not its own row, and the original bill shows as cleared for the amount that was due
        expect(rows).toHaveLength(1);
        expect(rows.at(0)?.purchaseID).toBe(10);
        expect(rows.at(0)?.state).toBe(CONST.PAYMENT_HISTORY.STATE.CLEARED);
        expect(rows.at(0)?.amount).toBe(2700);
    });

    it('keeps the later change when a bill is both disputed and refunded', () => {
        // Given a bill that was disputed and then refunded
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 10}),
            createPurchase(21, '2026-04-01', {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 10}),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

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
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

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
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then the repeated person is counted once
        expect(rows.at(0)?.activeUserCount).toBe(2);
    });

    it('counts members only on bills that were on Collect 2025 pricing', () => {
        // Given a bill on Collect 2025 pricing and an older bill that wasn't
        const purchaseList = [createPurchase(1, '2026-02-01'), createPurchase(2, '2026-08-01', {isTeam2025Pricing: true})];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then each row follows its own bill's pricing, so a plan change doesn't relabel past bills
        expect(rows.find((row) => row.purchaseID === 2)?.countsMembers).toBe(true);
        expect(rows.find((row) => row.purchaseID === 1)?.countsMembers).toBe(false);
    });

    it('uses totalActorCount on a legacy bill even when totalUniqueMembersCount is higher', () => {
        // Given a legacy bill where totalUniqueMembersCount counts every member of every workspace (including archived),
        // while totalActorCount reflects the users actually billed — Classic shows the billed count, so we must too.
        const purchaseList = [
            createPurchase(1, '2026-02-01', {
                isTeam2025Pricing: false,
                totalActorCount: 2,
                totalUniqueMembersCount: 5,
                billablePolicies: {
                    first: {actorList: 'ada@example.com', corporate: true},
                    second: {actorList: 'bob@example.com', corporate: false},
                },
            }),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then the row shows the billed-actor count, matching the details page
        expect(rows.at(0)?.activeUserCount).toBe(2);
    });

    it('uses the larger of teamActorCount and totalUniqueMembersCount on a Team 2025 bill', () => {
        // Given a Team 2025 bill where a force-upgraded policy inflated teamActorCount above totalUniqueMembersCount
        const purchaseList = [
            createPurchase(1, '2026-02-01', {
                isTeam2025Pricing: true,
                teamActorCount: 7,
                totalUniqueMembersCount: 4,
            }),
            createPurchase(2, '2026-03-01', {
                isTeam2025Pricing: true,
                teamActorCount: 2,
                totalUniqueMembersCount: 6,
            }),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then each row uses the larger count — team actors in the first case, unique members in the second
        expect(rows.find((row) => row.purchaseID === 1)?.activeUserCount).toBe(7);
        expect(rows.find((row) => row.purchaseID === 2)?.activeUserCount).toBe(6);
    });

    it('coerces string actor counts from Auth into numbers', () => {
        // Given counts that arrive as strings from Auth (totalActorCount / teamActorCount are serialized as strings there)
        const purchaseList = [
            createPurchase(1, '2026-02-01', {
                isTeam2025Pricing: false,
                totalActorCount: '3',
            }),
            createPurchase(2, '2026-03-01', {
                isTeam2025Pricing: true,
                teamActorCount: '4',
                totalUniqueMembersCount: 2,
            }),
        ];

        // When the table rows are built
        const rows = getPaymentHistoryRows(toPurchases(purchaseList));

        // Then the counts are numeric and compared correctly
        expect(rows.find((row) => row.purchaseID === 1)?.activeUserCount).toBe(3);
        expect(rows.find((row) => row.purchaseID === 2)?.activeUserCount).toBe(4);
    });
});

describe('getPaymentHistoryRow', () => {
    it('returns the single row for a bill', () => {
        // Given two bills in Onyx
        const purchaseList = [createPurchase(1, '2026-02-01'), createPurchase(2, '2026-03-01')];

        // When one bill's row is requested
        const row = getPaymentHistoryRow(toPurchases(purchaseList), 2);

        // Then that bill's row is returned
        expect(row?.purchaseID).toBe(2);
    });

    it('returns undefined for an unknown purchase', () => {
        // Given a bill in Onyx
        const purchaseList = [createPurchase(1, '2026-02-01')];

        // When a purchase that is not in Onyx is requested
        const row = getPaymentHistoryRow(toPurchases(purchaseList), 999);

        // Then nothing is returned
        expect(row).toBeUndefined();
    });
});

describe('getPaymentDetailsBadge', () => {
    it('reads the transferred-to email from a folded balance transfer', () => {
        // Given a bill whose balance was transferred to another user
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_TRANSFER_TO, fromPurchaseID: 10, transferTo: 'to@example.com'}),
        ];

        // When the bill's details badge is built
        const badge = getPaymentDetailsBadge(toPurchases(purchaseList), 10);

        // Then the badge carries the transferred-to email
        expect(badge).toEqual({variant: 'balanceTransferTo', email: 'to@example.com'});
    });

    it('reads the transferred-from email from a standalone balance transfer', () => {
        // Given a balance transfer whose source bill is not in Onyx, so it is its own row
        const purchaseList = [createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_TRANSFER, fromPurchaseID: 999, takenOverFrom: 'from@example.com'})];

        // When the row's details badge is built
        const badge = getPaymentDetailsBadge(toPurchases(purchaseList), 20);

        // Then the badge carries the transferred-from email
        expect(badge).toEqual({variant: 'balanceTransferFrom', email: 'from@example.com'});
    });

    it('classifies a closed-and-refunded dispute', () => {
        // Given a disputed bill whose dispute was lost
        const purchaseList = [createPurchase(10, '2026-02-01'), createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 10, disputeStatus: 'lost'})];

        // When the bill's details badge is built
        const badge = getPaymentDetailsBadge(toPurchases(purchaseList), 10);

        // Then the badge is a refunded dispute dated to the dispute purchase
        expect(badge).toEqual({variant: 'disputed', created: '2026-03-01', status: 'refunded'});
    });

    it('classifies a won dispute as closed and an open dispute as pending', () => {
        // Given one won dispute and one with no status yet
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(11, '2026-02-02'),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 10, disputeStatus: 'won'}),
            createPurchase(21, '2026-03-02', {billingType: CONST.BILLING.TYPE_DISPUTE, disputePurchaseID: 11}),
        ];
        const purchases = toPurchases(purchaseList);

        // When each bill's details badge is built
        // Then a won dispute is closed and a status-less dispute is pending
        expect(getPaymentDetailsBadge(purchases, 10)).toEqual({variant: 'disputed', created: '2026-03-01', status: 'closed'});
        expect(getPaymentDetailsBadge(purchases, 11)).toEqual({variant: 'disputed', created: '2026-03-02', status: 'pending'});
    });

    it('carries the amount for a partial refund and nothing extra for a full refund', () => {
        // Given one bill refunded in part and one refunded in full
        const purchaseList = [
            createPurchase(10, '2026-02-01'),
            createPurchase(11, '2026-02-02'),
            createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 10, isPartialRefund: true}, -500),
            createPurchase(21, '2026-03-02', {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 11}, -1000),
        ];
        const purchases = toPurchases(purchaseList);

        // When each bill's details badge is built
        // Then the partial refund carries its positive amount and currency, and the full refund does not
        expect(getPaymentDetailsBadge(purchases, 10)).toEqual({variant: 'refundedPartial', created: '2026-03-01', amount: 500, currency: CONST.CURRENCY.USD});
        expect(getPaymentDetailsBadge(purchases, 11)).toEqual({variant: 'refunded', created: '2026-03-02'});
    });

    it('returns the default variant for a plain paid bill', () => {
        // Given a bill with no modifier
        const purchaseList = [createPurchase(10, '2026-02-01')];

        // When the bill's details badge is built
        const badge = getPaymentDetailsBadge(toPurchases(purchaseList), 10);

        // Then it falls back to the default badge
        expect(badge).toEqual({variant: 'default'});
    });
});

describe('getBadgeText', () => {
    // Returns the translation key plus any values the label interpolates, so the test can assert the key without a real locale.
    const translate: LocaleContextProps['translate'] = (key, ...parameters) => {
        const params = parameters.at(0);
        return JSON.stringify({key, ...(params && typeof params === 'object' ? params : {})});
    };

    it('falls back to the plain state label when the badge has no extra detail', () => {
        // Given a bill whose badge carries nothing beyond its paid state
        const badge = {variant: 'default' as const};

        // When the details badge label is resolved
        const text = getBadgeText(badge, CONST.PAYMENT_HISTORY.STATE.PAID, translate, undefined);

        // Then the label is the plain paid state, with no extra detail
        expect(text).toBe(JSON.stringify({key: 'subscription.paymentHistory.state.paid'}));
    });

    it('includes the account email on a balance transfer', () => {
        // Given a balance that moved to another account
        const badge = {variant: 'balanceTransferTo' as const, email: 'owner@example.com'};

        // When the details badge label is resolved
        const text = getBadgeText(badge, CONST.PAYMENT_HISTORY.STATE.BALANCE_TRANSFER, translate, undefined);

        // Then the label names the account that received the balance
        expect(text).toBe(JSON.stringify({key: 'subscription.paymentHistory.badge.balanceTransferTo', email: 'owner@example.com'}));
    });

    it('includes the formatted date and amount on a partial refund', () => {
        // Given a partial refund of $5.00 on March 1, 2026
        const badge = {variant: 'refundedPartial' as const, created: '2026-03-01', amount: 500, currency: CONST.CURRENCY.USD};

        // When the details badge label is resolved
        const text = getBadgeText(badge, CONST.PAYMENT_HISTORY.STATE.REFUNDED, translate, undefined);

        // Then the label carries the displayed amount and the same date format as the details page
        expect(text).toBe(
            JSON.stringify({
                key: 'subscription.paymentHistory.badge.refundedAmountOn',
                amount: convertAmountToDisplayString(500, CONST.CURRENCY.USD),
                date: formatDate('2026-03-01', undefined),
            }),
        );
    });
});

describe('getReceiptSource', () => {
    it('returns the source when the purchase has a receipt', () => {
        // Given a purchase with a resolved receipt
        const purchase = createPurchase(1, '2026-02-01');
        purchase.receipt = {receiptID: 100, source: 'https://expensify.com/receipts/receipt.pdf'};

        // When the receipt source is resolved
        const source = getReceiptSource(toPurchases([purchase]), 1);

        // Then the source URL is returned
        expect(source).toBe('https://expensify.com/receipts/receipt.pdf');
    });

    it('returns null when the purchase has no receipt', () => {
        // Given a purchase without a receipt
        const purchase = createPurchase(1, '2026-02-01');

        // When the receipt source is resolved
        const source = getReceiptSource(toPurchases([purchase]), 1);

        // Then null is returned
        expect(source).toBeNull();
    });

    it('returns null when the receipt source is null', () => {
        // Given a purchase whose receipt has no source
        const purchase = createPurchase(1, '2026-02-01');
        purchase.receipt = {receiptID: 100, source: null};

        // When the receipt source is resolved
        const source = getReceiptSource(toPurchases([purchase]), 1);

        // Then null is returned
        expect(source).toBeNull();
    });

    it('follows failedPurchaseID chain for cleared bills', () => {
        // Given a failed purchase with a receipt, cleared by a later purchase
        const failed = createPurchase(10, '2026-02-01', {billingType: CONST.BILLING.TYPE_FAILED});
        failed.receipt = {receiptID: 200, source: 'https://expensify.com/receipts/failed-receipt.pdf'};
        const clear = createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR, failedPurchaseID: 10});

        // When the clear purchase's receipt source is resolved
        const source = getReceiptSource(toPurchases([failed, clear]), 20);

        // Then the failed purchase's receipt source is returned
        expect(source).toBe('https://expensify.com/receipts/failed-receipt.pdf');
    });

    it('follows a multi-hop failedPurchaseID chain', () => {
        // Given a chain of failed purchases where the original has the receipt
        const original = createPurchase(10, '2026-01-01', {billingType: CONST.BILLING.TYPE_FAILED});
        original.receipt = {receiptID: 300, source: 'https://expensify.com/receipts/original.pdf'};
        const retry = createPurchase(20, '2026-02-01', {billingType: CONST.BILLING.TYPE_FAILED, failedPurchaseID: 10});
        const clear = createPurchase(30, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR, failedPurchaseID: 20});

        // When the clear purchase's receipt source is resolved
        const source = getReceiptSource(toPurchases([original, retry, clear]), 30);

        // Then the original purchase's receipt source is found through the chain
        expect(source).toBe('https://expensify.com/receipts/original.pdf');
    });

    it('returns null when the chain leads to a purchase without a receipt', () => {
        // Given a clear purchase pointing to a failed purchase with no receipt
        const failed = createPurchase(10, '2026-02-01', {billingType: CONST.BILLING.TYPE_FAILED});
        const clear = createPurchase(20, '2026-03-01', {billingType: CONST.BILLING.TYPE_CLEAR, failedPurchaseID: 10});

        // When the clear purchase's receipt source is resolved
        const source = getReceiptSource(toPurchases([failed, clear]), 20);

        // Then null is returned
        expect(source).toBeNull();
    });

    it('returns null for an unknown purchaseID', () => {
        // Given a purchases map that does not contain the requested ID
        const purchases = toPurchases([createPurchase(1, '2026-02-01')]);

        // When resolving a receipt source for a non-existent purchase
        const source = getReceiptSource(purchases, 999);

        // Then null is returned
        expect(source).toBeNull();
    });
});

describe('isInvoiceBilling', () => {
    it('returns true for an invoice bill with a receipt', () => {
        // Given an invoice purchase with a receipt source
        const purchase = createPurchase(1, '2026-02-01', {billingType: CONST.BILLING.TYPE_INVOICING});
        purchase.receipt = {receiptID: 100, source: 'https://example.com/invoice.pdf'};

        // When checking if the purchase is invoice billing
        // Then it returns true
        expect(isInvoiceBilling(toPurchases([purchase]), 1)).toBe(true);
    });

    it('returns true for a cleared invoice by following the failedPurchaseID chain', () => {
        // Given a cleared invoice bill whose original failed invoice holds the receipt
        const failedInvoice = createPurchase(10, '2026-02-01', {billingType: CONST.BILLING.TYPE_INVOICING});
        failedInvoice.receipt = {receiptID: 200, source: 'https://example.com/invoice.pdf'};
        const clear = createPurchase(20, '2026-02-05', {billingType: CONST.BILLING.TYPE_CLEAR, failedPurchaseID: 10});

        // When checking if the clear purchase is invoice billing
        // Then it follows the chain to the failed invoice and returns true
        expect(isInvoiceBilling(toPurchases([failedInvoice, clear]), 20)).toBe(true);
    });

    it('returns false for non-invoicing billing type', () => {
        // Given a non-invoicing purchase with a receipt
        const purchase = createPurchase(1, '2026-02-01', {billingType: CONST.BILLING.TYPE_CLEAR});
        purchase.receipt = {receiptID: 100, source: 'https://example.com/receipt.pdf'};

        // When checking if the purchase is invoice billing
        // Then it returns false
        expect(isInvoiceBilling(toPurchases([purchase]), 1)).toBe(false);
    });
});

describe('getReceiptFileName', () => {
    it('extracts filename from valid URL', () => {
        // Given a receipt URL with a filename
        // When extracting the filename
        // Then it returns the last path segment
        expect(getReceiptFileName('https://expensify.com/receipts/w_abc123.pdf', 42)).toBe('w_abc123.pdf');
    });

    it('falls back to receipt-purchaseID for invalid URL', () => {
        // Given an invalid URL string
        // When extracting the filename
        // Then it falls back to receipt-{purchaseID}
        expect(getReceiptFileName('not-a-url', 42)).toBe('receipt-42');
    });

    it('falls back to receipt-purchaseID for empty path', () => {
        // Given a URL with no path segments
        // When extracting the filename
        // Then it falls back to receipt-{purchaseID}
        expect(getReceiptFileName('https://expensify.com/', 7)).toBe('receipt-7');
    });
});

describe('getActiveUserAccountIDs', () => {
    it('dedupes users billed under more than one workspace', () => {
        // Given a purchase whose active users repeat, because one person was billed under two workspaces
        const purchase = {...createPurchase(1, '2026-02-01'), activeUsers: [10, 20, 10, 30]};

        // When the active users for the Activity list are read
        // Then each person is listed once, so the count under the Activity header matches the list
        expect(getActiveUserAccountIDs(purchase)).toEqual([10, 20, 30]);
    });

    it('returns no users when the details have not loaded or nobody was billed', () => {
        // Given a missing purchase, a purchase without active users, and a purchase with an empty list
        // When the active users are read
        // Then the list is empty, so the page hides the Activity section
        expect(getActiveUserAccountIDs(undefined)).toEqual([]);
        expect(getActiveUserAccountIDs(createPurchase(1, '2026-02-01'))).toEqual([]);
        expect(getActiveUserAccountIDs({...createPurchase(1, '2026-02-01'), activeUsers: []})).toEqual([]);
    });
});
