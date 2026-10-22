/**
 * Builds the payment history table rows from the Onyx purchases collection, folding refunds, disputes,
 * balance transfers, and cleared payments onto the bill they modify.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {Purchase, Purchases} from '@src/types/onyx/PurchaseList';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {ValueOf} from 'type-fest';

import {convertAmountToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';

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

/** The dynamic badge shown on the payment details page, carrying the extra detail that only renders there. */
type PaymentDetailsBadge =
    | {variant: 'balanceTransferTo'; email: string}
    | {variant: 'balanceTransferFrom'; email: string}
    | {variant: 'disputed'; created: string; status: 'pending' | 'refunded' | 'closed'}
    | {variant: 'refunded'; created: string}
    | {variant: 'refundedPartial'; created: string; amount: number; currency: string}
    | {variant: 'default'};

/** Dispute statuses that mean the dispute was closed in the user's favour, so the charge was refunded. */
const DISPUTE_STATUSES_REFUNDED: ReadonlySet<string> = new Set(['lost', 'charge_refunded']);

/** Dispute statuses that mean the dispute is closed, regardless of outcome. */
const DISPUTE_STATUSES_CLOSED: ReadonlySet<string> = new Set(['won', 'warning_closed', 'lost', 'charge_refunded']);

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
 * Maps each bill's purchaseID to the latest modifier purchase (refund, dispute, balance transfer, or clear) folded onto it.
 * The modifier carries the dynamic badge detail the details page renders.
 */
function getFoldedModifiers(purchaseList: Purchase[], purchaseIDs: Set<number>): Map<number, {created: string; state: PaymentHistoryState; modifier: Purchase}> {
    const foldedState = new Map<number, {created: string; state: PaymentHistoryState; modifier: Purchase}>();

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
            foldedState.set(parentPurchaseID, {created: purchase.created, state, modifier: purchase});
        }
    }

    return foldedState;
}

/**
 * Builds one table row per bill, newest first.
 * Refunds, disputes, balance transfers, and cleared payments are separate purchases that point at the bill they change, so they are folded onto that bill instead of listed on their own.
 */
function getPaymentHistoryRows(purchases: Purchases | null | undefined): PaymentHistoryRow[] {
    const purchaseList = Object.values(purchases ?? {}).filter((purchase) => !!purchase.purchaseID);
    if (!purchaseList.length) {
        return [];
    }

    const purchaseIDs = new Set(purchaseList.map((purchase) => purchase.purchaseID));
    const foldedState = getFoldedModifiers(purchaseList, purchaseIDs);

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

/** Returns the single payment history row for a bill, or undefined when that bill isn't in Onyx. */
function getPaymentHistoryRow(purchases: Purchases | null | undefined, purchaseID: number): PaymentHistoryRow | undefined {
    return getPaymentHistoryRows(purchases).find((row) => row.purchaseID === purchaseID);
}

function getDisputeStatus(disputeStatus: string | undefined): 'pending' | 'refunded' | 'closed' {
    if (!disputeStatus || !DISPUTE_STATUSES_CLOSED.has(disputeStatus)) {
        return 'pending';
    }
    return DISPUTE_STATUSES_REFUNDED.has(disputeStatus) ? 'refunded' : 'closed';
}

/**
 * Builds the dynamic badge for a bill's details page.
 * The extra detail lives on the folded modifier when one exists, otherwise on the bill itself (a standalone refund, dispute, or transfer row).
 */
function getPaymentDetailsBadge(purchases: Purchases | null | undefined, purchaseID: number): PaymentDetailsBadge {
    const purchaseList = Object.values(purchases ?? {});
    const purchaseIDs = new Set(purchaseList.map((purchase) => purchase.purchaseID));
    const modifier = getFoldedModifiers(purchaseList, purchaseIDs).get(purchaseID)?.modifier;
    const carrier = modifier ?? purchases?.[purchaseID];
    if (!carrier) {
        return {variant: 'default'};
    }

    if (isDispute(carrier)) {
        return {variant: 'disputed', created: carrier.created, status: getDisputeStatus(carrier.message.disputeStatus)};
    }
    if (isRefund(carrier)) {
        if (carrier.message.isPartialRefund) {
            return {variant: 'refundedPartial', created: carrier.created, amount: Math.abs(carrier.amount), currency: carrier.currency};
        }
        return {variant: 'refunded', created: carrier.created};
    }
    if (isBalanceTransfer(carrier)) {
        if (carrier.message.transferTo) {
            return {variant: 'balanceTransferTo', email: carrier.message.transferTo};
        }
        if (carrier.message.takenOverFrom) {
            return {variant: 'balanceTransferFrom', email: carrier.message.takenOverFrom};
        }
    }
    return {variant: 'default'};
}

function formatDate(date: string, locale: DateFnsLocale | undefined): string {
    return DateUtils.formatWithUTCTimeZone(date, CONST.DATE.MONTH_DAY_YEAR_FORMAT, locale) || date;
}

/** Resolves the dynamic badge label shown only on the details page, falling back to the plain state label. */
function getBadgeText(badge: PaymentDetailsBadge, state: PaymentHistoryState, translate: LocaleContextProps['translate'], locale: DateFnsLocale | undefined): string {
    switch (badge.variant) {
        case 'balanceTransferTo':
            return translate('subscription.paymentHistory.badge.balanceTransferTo', {email: badge.email});
        case 'balanceTransferFrom':
            return translate('subscription.paymentHistory.badge.balanceTransferFrom', {email: badge.email});
        case 'disputed':
            if (badge.status === 'refunded') {
                return translate('subscription.paymentHistory.badge.disputedRefunded', {date: formatDate(badge.created, locale)});
            }
            if (badge.status === 'closed') {
                return translate('subscription.paymentHistory.badge.disputedClosed', {date: formatDate(badge.created, locale)});
            }
            return translate('subscription.paymentHistory.badge.disputedPending', {date: formatDate(badge.created, locale)});
        case 'refunded':
            return translate('subscription.paymentHistory.badge.refundedOn', {date: formatDate(badge.created, locale)});
        case 'refundedPartial':
            return translate('subscription.paymentHistory.badge.refundedAmountOn', {
                amount: convertAmountToDisplayString(badge.amount, badge.currency),
                date: formatDate(badge.created, locale),
            });
        default:
            return translate(getStateTranslationKey(state));
    }
}

/**
 * Returns the purchase whose receipt source applies to this bill, walking the failedPurchaseID chain for cleared bills.
 */
function getReceiptPurchase(purchases: Purchases | null | undefined, purchaseID: number): Purchase | null {
    if (!purchases) {
        return null;
    }
    const purchase = purchases[String(purchaseID)];
    if (!purchase) {
        return null;
    }
    if (purchase.receipt?.source) {
        return purchase;
    }

    if (!isClear(purchase) || !purchase.message.failedPurchaseID) {
        return null;
    }

    const visited = new Set<number>([purchaseID]);
    let currentID: number | undefined = purchase.message.failedPurchaseID;
    while (currentID !== undefined && !visited.has(currentID)) {
        visited.add(currentID);
        const current: Purchase | undefined = purchases[String(currentID)];
        if (!current) {
            return null;
        }
        if (current.receipt?.source) {
            return current;
        }
        currentID = current.message.failedPurchaseID;
    }

    return null;
}

function getReceiptSource(purchases: Purchases | null | undefined, purchaseID: number): string | null {
    return getReceiptPurchase(purchases, purchaseID)?.receipt?.source ?? null;
}

function isInvoiceBilling(purchases: Purchases | null | undefined, purchaseID: number): boolean {
    return getReceiptPurchase(purchases, purchaseID)?.message.billingType === CONST.BILLING.TYPE_INVOICING;
}

function getReceiptFileName(source: string, purchaseID: number): string {
    try {
        const pathname = new URL(source).pathname;
        return pathname.split('/').pop() || `receipt-${purchaseID}`;
    } catch {
        return `receipt-${purchaseID}`;
    }
}

export {
    formatDate,
    getBadgeAppearance,
    getBadgeText,
    getPaymentDetailsBadge,
    getPaymentHistoryRow,
    getPaymentHistoryRows,
    getReceiptFileName,
    getReceiptSource,
    getStateTranslationKey,
    isInvoiceBilling,
};
export type {PaymentHistoryRow};
