/** Onyx selectors used by the confirmation field leaves. */
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {canSendInvoice} from '@libs/PolicyUtils';
import getReportNameValuePairsForReports from '@libs/ReportNameValuePairsUtils';
import {
    getCategory,
    getCreated,
    getCurrency,
    getMerchant,
    getTagForDisplay,
    hasReceipt,
    isAmountMissing,
    isCreatedMissing,
    isMerchantMissing,
    willFieldBeAutomaticallyFilled,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type Transaction = OnyxTypes.Transaction;

// --- DateField ---

type DateState = {iouCreated: string; isMissing: boolean};

const dateStateSelector = (t: OnyxEntry<Transaction>): DateState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        iouCreated: getCreated(t),
        isMissing: isCreatedMissing(t),
    };
};

// --- TimeFields ---

type TimeState = {count: number | undefined; rate: number | undefined; currency: string};

const timeStateSelector = (t: OnyxEntry<Transaction>): TimeState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        count: t.comment?.units?.count,
        rate: t.comment?.units?.rate,
        currency: getCurrency(t),
    };
};

// --- AttendeeField ---

type AttendeeSlice = {
    modifiedAttendees: Transaction['modifiedAttendees'];
    comment: {attendees: NonNullable<Transaction['comment']>['attendees']} | undefined;
    reportID: Transaction['reportID'];
};

const attendeeSliceSelector = (t: OnyxEntry<Transaction>): AttendeeSlice | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        modifiedAttendees: t.modifiedAttendees,
        comment: t.comment ? {attendees: t.comment.attendees} : undefined,
        reportID: t.reportID,
    };
};

// --- ToggleFields ---

type ToggleState = {billable: boolean; reimbursable: boolean};

const toggleStateSelector = (t: OnyxEntry<Transaction>): ToggleState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        billable: t.billable ?? false,
        reimbursable: t.reimbursable ?? true,
    };
};

// --- TagFields (factory — selector closes over tagIndex) ---

const createTagDisplaySelector = (tagIndex: number) => (t: OnyxEntry<Transaction>) => {
    if (!t) {
        return undefined;
    }
    return getTagForDisplay({tag: t.tag} as OnyxEntry<Transaction>, tagIndex);
};

// --- CategoryField ---

type CategoryState = {category: string; willAutoFill: boolean};

const categoryStateSelector = (t: OnyxEntry<Transaction>): CategoryState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        category: getCategory(t),
        willAutoFill: willFieldBeAutomaticallyFilled(t, 'category'),
    };
};

// --- MerchantField ---

type MerchantState = {merchant: string; isMissing: boolean; hasReceipt: boolean};

const merchantStateSelector = (t: OnyxEntry<Transaction>): MerchantState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        merchant: getMerchant(t),
        isMissing: isMerchantMissing(t),
        hasReceipt: hasReceipt(t),
    };
};

// --- DescriptionField ---

type DescriptionState = {description: string; hasReceipt: boolean};

const descriptionStateSelector = (t: OnyxEntry<Transaction>): DescriptionState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        description: t.comment?.comment?.toString() ?? '',
        hasReceipt: hasReceipt(t),
    };
};

// --- AmountField ---

type AmountSlice = {
    participants: Transaction['participants'];
    splitShares: Transaction['splitShares'];
    amount: Transaction['amount'];
    currency: Transaction['currency'];
    transactionID: Transaction['transactionID'];
    iouRequestType: Transaction['iouRequestType'];
    comment: {type: NonNullable<Transaction['comment']>['type']; customUnit: NonNullable<Transaction['comment']>['customUnit']} | undefined;
    isAmountMissing: boolean;
    isAmountSet: Transaction['isAmountSet'];
};

const amountSliceSelector = (t: OnyxEntry<Transaction>): AmountSlice | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        participants: t.participants,
        splitShares: t.splitShares,
        amount: t.amount,
        currency: t.currency,
        transactionID: t.transactionID,
        iouRequestType: t.iouRequestType,
        comment: t.comment ? {type: t.comment.type, customUnit: t.comment.customUnit} : undefined,
        isAmountMissing: isAmountMissing(t),
        isAmountSet: t.isAmountSet,
    };
};

// --- TaxFields ---

type TaxSlice = {
    taxAmount: Transaction['taxAmount'];
    taxCode: Transaction['taxCode'];
    taxValue: Transaction['taxValue'];
    amount: Transaction['amount'];
    currency: Transaction['currency'];
    iouRequestType: Transaction['iouRequestType'];
    comment: {customUnit: NonNullable<Transaction['comment']>['customUnit']; type: NonNullable<Transaction['comment']>['type']} | undefined;
};

const taxSliceSelector = (t: OnyxEntry<Transaction>): TaxSlice | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        taxAmount: t.taxAmount,
        taxCode: t.taxCode,
        taxValue: t.taxValue,
        amount: t.amount,
        currency: t.currency,
        iouRequestType: t.iouRequestType,
        comment: t.comment ? {customUnit: t.comment.customUnit, type: t.comment.type} : undefined,
    };
};

// --- ConfirmationFieldList: useFooterDerivedFlags ---

type DerivedFlagsSlice = Pick<Transaction, 'modifiedCurrency' | 'currency' | 'iouRequestType' | 'reportID' | 'managedCard'>;

const derivedFlagsSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: DerivedFlagsSlice = {
        modifiedCurrency: t.modifiedCurrency,
        currency: t.currency,
        iouRequestType: t.iouRequestType,
        reportID: t.reportID,
        managedCard: t.managedCard,
    };
    return slice as Transaction;
};

// --- ConfirmationFieldList: useFooterTagVisibility ---

type TagSlice = Pick<Transaction, 'tag'>;

const tagSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: TagSlice = {tag: t.tag};
    return slice as Transaction;
};

// --- InvoiceSenderSection ---

type InvoiceSenderSlice = Pick<Transaction, 'isFromGlobalCreate' | 'transactionID'>;

const invoiceSenderSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: InvoiceSenderSlice = {
        isFromGlobalCreate: t.isFromGlobalCreate,
        transactionID: t.transactionID,
    };
    return slice as Transaction;
};

// --- DistanceMapSection ---

type DistanceMapSlice = Pick<Transaction, 'pendingFields' | 'errors' | 'errorFields' | 'routes'> & {
    comment: {waypoints: NonNullable<Transaction['comment']>['waypoints']} | undefined;
};

const distanceMapSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: DistanceMapSlice = {
        pendingFields: t.pendingFields,
        errors: t.errors,
        errorFields: t.errorFields,
        routes: t.routes,
        comment: t.comment ? {waypoints: t.comment.waypoints} : undefined,
    };
    return slice as Transaction;
};

// --- PerDiemSection ---

type PerDiemSlice = {comment: {customUnit: NonNullable<Transaction['comment']>['customUnit']} | undefined};

const perDiemSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: PerDiemSlice = {
        comment: t.comment ? {customUnit: t.comment.customUnit} : undefined,
    };
    return slice as Transaction;
};

// --- ReceiptSection ---

type ReceiptSlice = Pick<Transaction, 'iouRequestType' | 'receipt' | 'hasEReceipt' | 'transactionID' | 'pendingFields' | 'errors' | 'errorFields'>;

const receiptSliceSelector = (t: OnyxEntry<Transaction>): OnyxEntry<Transaction> => {
    if (!t) {
        return undefined;
    }
    const slice: ReceiptSlice = {
        iouRequestType: t.iouRequestType,
        receipt: t.receipt,
        hasEReceipt: t.hasEReceipt,
        transactionID: t.transactionID,
        pendingFields: t.pendingFields,
        errors: t.errors,
        errorFields: t.errorFields,
    };
    return slice as Transaction;
};

// --- ReportField ---

type ReportFieldTransactionState = {
    reportID: Transaction['reportID'];
    isFromGlobalCreate: boolean;
    participantReportID: string | undefined;
};
type OutstandingReportsForPolicy = OnyxTypes.OutstandingReportsByPolicyIDDerivedValue[string];

const reportFieldTransactionStateSelector = (t: OnyxEntry<Transaction>): ReportFieldTransactionState | undefined => {
    if (!t) {
        return undefined;
    }
    return {
        reportID: t.reportID,
        isFromGlobalCreate: !!t.isFromGlobalCreate,
        participantReportID: t.participants?.at(0)?.reportID,
    };
};

const createOutstandingReportsForPolicySelector = (policyID: string | undefined) => (derived: OnyxEntry<OnyxTypes.OutstandingReportsByPolicyIDDerivedValue>) =>
    derived?.[policyID ?? CONST.DEFAULT_NUMBER_ID];

const createOutstandingReportsNVPsSelector =
    (outstandingReports: OutstandingReportsForPolicy | undefined) =>
    (allNVPs: OnyxCollection<OnyxTypes.ReportNameValuePairs>): OnyxCollection<OnyxTypes.ReportNameValuePairs> | undefined => {
        if (!outstandingReports || !allNVPs) {
            return undefined;
        }
        return getReportNameValuePairsForReports(outstandingReports, allNVPs);
    };

// --- InvoiceSenderField ---

type InvoiceSenderWorkspace = {id: string | undefined; name: string | undefined; avatarURL: string | undefined} | undefined;

const invoiceSenderWorkspaceSelector = (p: OnyxEntry<OnyxTypes.Policy>): InvoiceSenderWorkspace => {
    if (!p) {
        return undefined;
    }
    return {id: p.id, name: p.name, avatarURL: p.avatarURL};
};

const createCanUpdateSenderWorkspaceSelector =
    (selectedParticipants: Participant[], currentUserLogin: string | undefined, isFromGlobalCreate: boolean) =>
    (policies: OnyxCollection<OnyxTypes.Policy>): boolean => {
        const isInvoiceRoomParticipant = selectedParticipants.some((participant) => participant.isInvoiceRoom);
        return canSendInvoice(policies ?? null, currentUserLogin) && isFromGlobalCreate && !isInvoiceRoomParticipant;
    };

export {
    amountSliceSelector,
    attendeeSliceSelector,
    categoryStateSelector,
    createCanUpdateSenderWorkspaceSelector,
    createOutstandingReportsNVPsSelector,
    createOutstandingReportsForPolicySelector,
    createTagDisplaySelector,
    dateStateSelector,
    derivedFlagsSliceSelector,
    descriptionStateSelector,
    distanceMapSliceSelector,
    invoiceSenderSliceSelector,
    invoiceSenderWorkspaceSelector,
    merchantStateSelector,
    perDiemSliceSelector,
    receiptSliceSelector,
    reportFieldTransactionStateSelector,
    tagSliceSelector,
    taxSliceSelector,
    timeStateSelector,
    toggleStateSelector,
};
