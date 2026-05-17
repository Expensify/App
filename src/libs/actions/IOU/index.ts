import type {OnyxCollection, OnyxEntry, OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {UpdateMoneyRequestParams} from '@libs/API/parameters';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt} from '@src/types/onyx/Transaction';
import type BaseTransactionParams from './types/BaseTransactionParams';
import type RequestMoneyParticipantParams from './types/RequestMoneyParticipantParams';
import type {GPSPoint} from './types/TrackExpenseTransactionParams';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type UpdateMoneyRequestData<TKey extends OnyxKey> = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData<TKey>;
};

let allPersonalDetails: OnyxTypes.PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

type StartSplitBilActionParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    comment: string;
    receipt: Receipt;
    existingSplitChatReportID?: string;
    billable?: boolean;
    reimbursable?: boolean;
    category: string | undefined;
    tag: string | undefined;
    currency: string;
    taxCode: string;
    taxAmount: number;
    taxValue?: string;
    shouldPlaySound?: boolean;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    participantsPolicyTags: Record<string, OnyxTypes.PolicyTagLists>;
};

type ReplaceReceipt = {
    transactionID: string;
    file?: File;
    source: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>;
    isSameReceipt?: boolean;
    transactionPolicyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
};

let allTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactions = {};
            return;
        }

        allTransactions = value;
    },
});

let allTransactionDrafts: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

let allTransactionViolations: NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactionViolations = {};
            return;
        }

        allTransactionViolations = value;
    },
});

let allPolicyTags: OnyxCollection<OnyxTypes.PolicyTagLists> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allReportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

let deprecatedUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        deprecatedUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let deprecatedCurrentUserPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        deprecatedCurrentUserPersonalDetails = value?.[deprecatedUserAccountID] ?? undefined;
    },
});

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});

// Use connectWithoutView because this is created for non-UI task only
let recentAttendees: OnyxEntry<Attendee[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
    callback: (value) => (recentAttendees = value),
});

function getAllPersonalDetails(): OnyxTypes.PersonalDetailsList {
    return allPersonalDetails;
}

function getAllTransactions(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactions;
}

function getAllTransactionViolations(): NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> {
    return allTransactionViolations;
}

function getAllReports(): OnyxCollection<OnyxTypes.Report> {
    return allReports;
}

function getAllReportActionsFromIOU(): OnyxCollection<OnyxTypes.ReportActions> {
    return allReportActions;
}

function getAllReportNameValuePairs(): OnyxCollection<OnyxTypes.ReportNameValuePairs> {
    return allReportNameValuePairs;
}

function getAllTransactionDrafts(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactionDrafts;
}

function getUserAccountID(): number {
    return deprecatedUserAccountID;
}

function getCurrentUserPersonalDetails(): OnyxEntry<OnyxTypes.PersonalDetails> {
    return deprecatedCurrentUserPersonalDetails;
}

function getRecentAttendees(): OnyxEntry<Attendee[]> {
    return recentAttendees;
}

/**
 * This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with params passed to the functions or useOnyx hook in React components.
 */
function getPolicyTags(): OnyxCollection<OnyxTypes.PolicyTagLists> {
    return allPolicyTags;
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `buildParticipantsPolicyTags` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with params passed to the functions or useOnyx hook in React components.
 */
function buildParticipantsPolicyTags(participants: Participant[]): Record<string, OnyxTypes.PolicyTagLists> {
    return participants.reduce<Record<string, OnyxTypes.PolicyTagLists>>((acc, participant) => {
        if (participant.policyID) {
            const tags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${participant.policyID}`];
            if (tags) {
                acc[participant.policyID] = tags;
            }
        }
        return acc;
    }, {});
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getMoneyRequestPolicyTags` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getMoneyRequestPolicyTags({
    existingIOUReport,
    moneyRequestReportID,
    parentChatReport,
    participant,
}: {
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    moneyRequestReportID?: string;
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    participant: Participant;
}): OnyxTypes.PolicyTagLists {
    const iouReportPolicyID =
        existingIOUReport?.policyID ??
        (moneyRequestReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`]?.policyID : undefined) ??
        parentChatReport?.policyID ??
        allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`]?.policyID;
    return getPolicyTagsData(iouReportPolicyID) ?? {};
}

function setMoneyRequestReceiptState(transactionID: string, isDraft: boolean, shouldStopSmartscan = false) {
    if (!isDraft || !shouldStopSmartscan) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}});
}

function setMoneyRequestAmount(transactionID: string, amount: number, currency: string, shouldShowOriginalAmount = false, shouldStopSmartscan = false) {
    // Mark that the user has explicitly set the amount. This is used by the new manual expense flow to distinguish
    // a default amount of 0 (field empty) from a user-entered 0 (valid $0 expense).
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, shouldShowOriginalAmount, isAmountSet: true});
    setMoneyRequestReceiptState(transactionID, true, shouldStopSmartscan);
}

/**
 * Clears the amount field back to an empty/unset state in the new manual expense flow.
 * Called when the user deletes all characters from the amount input so that the field
 * shows as empty and submission is blocked until a value is entered again.
 */
function clearMoneyRequestAmount(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount: 0, isAmountSet: false});
}

function clearMoneyRequestMerchant(transactionID: string, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant: '', isMerchantSet: false});
}

function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestDateAttribute(transactionID: string, start: string, end: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {attributes: {dates: {start, end}}}}});
}

function setMoneyRequestCurrency(transactionID: string, currency: string, isEditing = false) {
    const fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {[fieldToUpdate]: currency});
}

function setMoneyRequestDescription(transactionID: string, comment: string, isDraft: boolean, shouldStopSmartscan = false) {
    // Trim only when persisting to the real transaction (not a draft) to avoid
    // stripping trailing spaces/newlines while the user is still typing.
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {comment: isDraft ? comment : comment.trim()}});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestMerchant(transactionID: string, merchant: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant, isMerchantSet: true});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}
function setMoneyRequestAttendees(transactionID: string, attendees: Attendee[], isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {attendees}});
}

function setMoneyRequestAccountant(transactionID: string, accountant: Accountant, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {accountant});
}

function setMoneyRequestPendingFields(transactionID: string, pendingFields: OnyxTypes.Transaction['pendingFields']) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {pendingFields});
}

function setMoneyRequestTag(transactionID: string, tag: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {tag});
}

function setMoneyRequestBillable(transactionID: string, billable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {billable});
}

function setMoneyRequestReimbursable(transactionID: string, reimbursable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reimbursable});
}

function setMoneyRequestReportID(transactionID: string, reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reportID});
}

export {
    setMoneyRequestAmount,
    clearMoneyRequestAmount,
    clearMoneyRequestMerchant,
    setMoneyRequestAttendees,
    setMoneyRequestAccountant,
    setMoneyRequestBillable,
    setMoneyRequestCreated,
    setMoneyRequestDateAttribute,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestMerchant,
    setMoneyRequestReportID,
    setMoneyRequestPendingFields,
    setMoneyRequestTag,
    setMoneyRequestReimbursable,
    getAllPersonalDetails,
    getAllTransactions,
    getAllTransactionViolations,
    getAllReports,
    getAllReportActionsFromIOU,
    getAllReportNameValuePairs,
    getAllTransactionDrafts,
    getUserAccountID,
    getCurrentUserPersonalDetails,
    getRecentAttendees,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    buildParticipantsPolicyTags,
    // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
    getPolicyTagsData,
    getPolicyTags,
    getMoneyRequestPolicyTags,
};
export type {GPSPoint as GpsPoint, IOURequestType, StartSplitBilActionParams, ReplaceReceipt, RequestMoneyParticipantParams, UpdateMoneyRequestData, BaseTransactionParams};
