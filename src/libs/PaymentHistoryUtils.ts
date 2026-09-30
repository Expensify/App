/**
 * Builds the payment history table rows from the raw Onyx purchase list, folding refunds, disputes,
 * balance transfers, and cleared payments onto the bill they modify.
 */
import CONST from '@src/CONST';
import type {Purchase} from '@src/types/onyx/PurchaseList';

import type {ValueOf} from 'type-fest';

type PaymentHistoryState = ValueOf<typeof CONST.PAYMENT_HISTORY.STATE>;

type PaymentHistoryRow = {
    purchaseID: number;
    created: string;
    /** Amount in cents, always positive, in the purchase currency. */
    amount: number;
    currency: string;
    showsTax: boolean;
    state: PaymentHistoryState;
    activeUserCount?: number;
};

const FAILED_BILLING_TYPES: ReadonlySet<string> = new Set([
    CONST.BILLING.TYPE_FAILED,
    CONST.BILLING.TYPE_FAILED_2018,
    CONST.BILLING.TYPE_FAILED_SMARTSCAN,
    CONST.BILLING.TYPE_STRIPE_FAILED_AUTHENTICATION,
]);

const TRANSFER_BILLING_TYPES: ReadonlySet<string> = new Set([
    CONST.BILLING.TYPE_TRANSFER,
    CONST.BILLING.TYPE_TRANSFER_TO,
    CONST.BILLING.TYPE_TRANSFER_FAILED,
    CONST.BILLING.TYPE_TRANSFER_OLD,
]);

/**
 * Builds one table row per bill, newest first.
 * Refunds, disputes, balance transfers, and cleared payments are separate purchases that point at the bill they change, so they are folded onto that bill instead of listed on their own.
 */
function getPaymentHistoryRows(purchaseList: Purchase[] | null | undefined): PaymentHistoryRow[] {
    if (!purchaseList?.length) {
        return [];
    }

    const purchaseIDs = new Set(purchaseList.map((purchase) => purchase.purchaseID));
    const foldedState = new Map<number, {created: string; state: PaymentHistoryState}>();

    for (const purchase of purchaseList) {
        const parentPurchaseID = getParentPurchaseID(purchase);
        if (parentPurchaseID === undefined || !purchaseIDs.has(parentPurchaseID)) {
            continue;
        }

        const state = getModifierState(purchase);
        if (!state) {
            continue;
        }

        const current = foldedState.get(parentPurchaseID);
        if (!current || purchase.created >= current.created) {
            foldedState.set(parentPurchaseID, {created: purchase.created, state});
        }
    }

    const rows: PaymentHistoryRow[] = [];
    for (const purchase of purchaseList) {
        const parentPurchaseID = getParentPurchaseID(purchase);
        if (parentPurchaseID !== undefined && purchaseIDs.has(parentPurchaseID)) {
            continue;
        }

        rows.push({
            purchaseID: purchase.purchaseID,
            created: purchase.created,
            amount: getDisplayAmount(purchase),
            currency: purchase.currency,
            showsTax: !!purchase.message.salesTaxCharged && !purchase.message.salesTaxExempt,
            state: foldedState.get(purchase.purchaseID)?.state ?? getOwnState(purchase),
            activeUserCount: getActiveUserCount(purchase),
        });
    }

    return rows.sort(compareNewestFirst);
}

function getParentPurchaseID(purchase: Purchase): number | undefined {
    if (isDispute(purchase)) {
        return purchase.message.disputePurchaseID;
    }
    if (isRefund(purchase)) {
        return purchase.message.refundPurchaseID;
    }
    if (isBalanceTransfer(purchase)) {
        return purchase.message.fromPurchaseID;
    }
    if (isClear(purchase)) {
        return purchase.message.failedPurchaseID;
    }
    return undefined;
}

function getModifierState(purchase: Purchase): PaymentHistoryState | undefined {
    if (isDispute(purchase)) {
        return CONST.PAYMENT_HISTORY.STATE.DISPUTED;
    }
    if (isRefund(purchase)) {
        return CONST.PAYMENT_HISTORY.STATE.REFUNDED;
    }
    if (isBalanceTransfer(purchase)) {
        return CONST.PAYMENT_HISTORY.STATE.BALANCE_TRANSFER;
    }
    if (isClear(purchase)) {
        return CONST.PAYMENT_HISTORY.STATE.CLEARED;
    }
    return undefined;
}

function getOwnState(purchase: Purchase): PaymentHistoryState {
    const modifierState = getModifierState(purchase);
    if (modifierState) {
        return modifierState;
    }
    if (purchase.message.billingType && FAILED_BILLING_TYPES.has(purchase.message.billingType)) {
        return CONST.PAYMENT_HISTORY.STATE.FAILED;
    }
    return CONST.PAYMENT_HISTORY.STATE.PAID;
}

function isRefund(purchase: Purchase): boolean {
    return purchase.message.billingType === CONST.BILLING.TYPE_REFUND || purchase.message.billingType === CONST.BILLING.TYPE_CC_REFUND;
}

function isDispute(purchase: Purchase): boolean {
    return purchase.message.billingType === CONST.BILLING.TYPE_DISPUTE;
}

function isClear(purchase: Purchase): boolean {
    return purchase.message.billingType === CONST.BILLING.TYPE_CLEAR;
}

function isBalanceTransfer(purchase: Purchase): boolean {
    const billingType = purchase.message.billingType;
    return (!!billingType && TRANSFER_BILLING_TYPES.has(billingType)) || !!purchase.message.takenOverFrom || !!purchase.message.transferTo;
}

function getDisplayAmount(purchase: Purchase): number {
    const isFailed = !!purchase.message.billingType && FAILED_BILLING_TYPES.has(purchase.message.billingType);
    // A failed charge never moved money, so the stored amount is empty and the amount that was due lives on the message.
    const rawAmount = isFailed && purchase.message.billableAmount ? purchase.message.billableAmount : purchase.amount;
    return Math.abs(rawAmount);
}

function getActiveUserCount(purchase: Purchase): number | undefined {
    if (purchase.message.totalUniqueMembersCount !== undefined) {
        return purchase.message.totalUniqueMembersCount;
    }
    if (purchase.message.totalActorCount !== undefined) {
        return purchase.message.totalActorCount;
    }

    const emails = new Set<string>();
    for (const policy of Object.values(purchase.message.billablePolicies ?? {})) {
        for (const email of policy.actorList?.split(',') ?? []) {
            const trimmed = email.trim();
            if (trimmed) {
                emails.add(trimmed);
            }
        }
    }
    return emails.size > 0 ? emails.size : undefined;
}

function compareNewestFirst(left: PaymentHistoryRow, right: PaymentHistoryRow): number {
    if (left.created === right.created) {
        return right.purchaseID - left.purchaseID;
    }
    return left.created < right.created ? 1 : -1;
}

function getStateTranslationKey(state: PaymentHistoryState) {
    switch (state) {
        case CONST.PAYMENT_HISTORY.STATE.CLEARED:
            return 'subscription.paymentHistory.state.cleared';
        case CONST.PAYMENT_HISTORY.STATE.FAILED:
            return 'subscription.paymentHistory.state.failed';
        case CONST.PAYMENT_HISTORY.STATE.REFUNDED:
            return 'subscription.paymentHistory.state.refunded';
        case CONST.PAYMENT_HISTORY.STATE.DISPUTED:
            return 'subscription.paymentHistory.state.disputed';
        case CONST.PAYMENT_HISTORY.STATE.BALANCE_TRANSFER:
            return 'subscription.paymentHistory.state.balanceTransfer';
        default:
            return 'subscription.paymentHistory.state.paid';
    }
}

function getBadgeAppearance(state: PaymentHistoryState): {success: boolean; error: boolean} {
    switch (state) {
        case CONST.PAYMENT_HISTORY.STATE.PAID:
            return {success: true, error: false};
        case CONST.PAYMENT_HISTORY.STATE.FAILED:
        case CONST.PAYMENT_HISTORY.STATE.DISPUTED:
            return {success: false, error: true};
        default:
            return {success: false, error: false};
    }
}

export {getBadgeAppearance, getPaymentHistoryRows, getStateTranslationKey};
export type {PaymentHistoryRow, PaymentHistoryState};
