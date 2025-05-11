import truncate from 'lodash/truncate';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {abandonReviewDuplicateTransactions, setReviewDuplicatesKey} from './actions/Transaction';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import type {PlatformStackRouteProp} from './Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from './Navigation/types';
import {getOriginalMessage, getReportAction, getReportActions, isMessageDeleted, isMoneyRequestAction} from './ReportActionsUtils';
import {hasActionsWithErrors, hasReportViolations, isPaidGroupPolicy, isPaidGroupPolicyExpenseReport, isReportApproved, isReportOwner, isSettled} from './ReportUtils';
import type {TransactionDetails} from './ReportUtils';
import StringUtils from './StringUtils';
import {
    compareDuplicateTransactionFields,
    getFormattedCreated,
    getTransaction,
    hasMissingSmartscanFields,
    hasNoticeTypeViolation,
    hasPendingRTERViolation,
    hasReceipt,
    hasViolation,
    hasWarningTypeViolation,
    isAmountMissing,
    isCardTransaction,
    isCreatedMissing,
    isDistanceRequest,
    isFetchingWaypointsFromServer,
    isMerchantMissing,
    isOnHold,
    isPending,
    isPerDiemRequest,
    isReceiptBeingScanned,
} from './TransactionUtils';

const emptyPersonalDetails: OnyxTypes.PersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

function getIOUData(managerID: number, ownerAccountID: number, isIOUReport: boolean, personalDetails: OnyxTypes.PersonalDetailsList | undefined, amount: number) {
    let fromID = ownerAccountID;
    let toID = managerID;

    if (amount < 0) {
        fromID = managerID;
        toID = ownerAccountID;
    }

    return fromID && toID && isIOUReport
        ? {
              from: personalDetails ? personalDetails[fromID] : emptyPersonalDetails,
              to: personalDetails ? personalDetails[toID] : emptyPersonalDetails,
          }
        : undefined;
}

const getReviewNavigationRoute = (
    route: PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, 'Transaction_Duplicate_Review'>,
    report: OnyxEntry<OnyxTypes.Report>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    duplicates: string[],
) => {
    const backTo = route.params.backTo;

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const reviewingTransactionID = isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    // Clear the draft before selecting a different expense to prevent merging fields from the previous expense
    // (e.g., category, tag, tax) that may be not enabled/available in the new expense's policy.
    abandonReviewDuplicateTransactions();
    const comparisonResult = compareDuplicateTransactionFields(reviewingTransactionID, transaction?.reportID, transaction?.transactionID ?? reviewingTransactionID);
    setReviewDuplicatesKey({...comparisonResult.keep, duplicates, transactionID: transaction?.transactionID, reportID: transaction?.reportID});

    if (comparisonResult.change.merchant) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.category) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.tag) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.description) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.taxCode) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.billable) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(route.params?.threadReportID, backTo);
    }
    if (comparisonResult.change.reimbursable) {
        return ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(route.params?.threadReportID, backTo);
    }

    return ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(route.params?.threadReportID, backTo);
};

type TranslationPathOrText = {
    translationPath?: TranslationPaths;
    text?: string;
};

const dotSeparator: TranslationPathOrText = {text: ` ${CONST.DOT_SEPARATOR} `};

const getOriginalTransactionIfBillIsSplit = (transaction: OnyxEntry<OnyxTypes.Transaction>) => {
    const {originalTransactionID, source, splits} = transaction?.comment ?? {};

    if (splits && splits.length > 0) {
        return {isBillSplit: true, originalTransaction: getTransaction(originalTransactionID) ?? transaction};
    }

    if (!originalTransactionID || source !== CONST.IOU.TYPE.SPLIT) {
        return {isBillSplit: false, originalTransaction: transaction};
    }

    const originalTransaction = getTransaction(originalTransactionID);

    return {isBillSplit: !!originalTransaction, originalTransaction: originalTransaction ?? transaction};
};

function getViolationTranslatePath(violations: OnyxTypes.TransactionViolations, hasFieldErrors: boolean, violationMessage: string, isTransactionOnHold: boolean): TranslationPathOrText {
    const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;

    const hasViolationsAndHold = violationsCount > 0 && isTransactionOnHold;
    const isTooLong = violationsCount > 1 || violationMessage.length > CONST.REPORT_VIOLATIONS.RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW;
    const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

    return isTooLong || hasViolationsAndHold || hasViolationsAndFieldErrors ? {translationPath: 'violations.reviewRequired'} : {text: violationMessage};
}

/**
 * Extracts unique error messages from report actions. If no report or actions are found,
 * it returns an empty array. It identifies the latest error in each action and filters out duplicates to
 * ensure only unique error messages are returned.
 */
function getUniqueActionErrors(report: OnyxEntry<OnyxTypes.Report>) {
    const reportActions = Object.values(report ? getReportActions(report) ?? {} : {});

    const reportErrors = reportActions.map((reportAction) => {
        const errors = reportAction.errors ?? {};
        const key = Object.keys(errors).sort().reverse().at(0) ?? '';
        const error = errors[key];
        return typeof error === 'string' ? error : '';
    });

    return [...new Set(reportErrors)].filter((err) => err.length);
}

function getTransactionPreviewTextAndTranslationPaths({
    iouReport,
    transaction,
    action,
    violations,
    transactionDetails,
    isBillSplit,
    shouldShowRBR,
    violationMessage,
}: {
    iouReport: OnyxEntry<OnyxTypes.Report>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    action: OnyxEntry<OnyxTypes.ReportAction>;
    violations: OnyxTypes.TransactionViolations;
    transactionDetails: Partial<TransactionDetails>;
    isBillSplit: boolean;
    shouldShowRBR: boolean;
    violationMessage?: string;
}) {
    const isFetchingWaypoints = isFetchingWaypointsFromServer(transaction);
    const isTransactionOnHold = isOnHold(transaction);
    const isTransactionMadeWithCard = isCardTransaction(transaction);
    const isMoneyRequestSettled = isSettled(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isTransactionOnHold;

    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isMoneyRequestSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;
    const showCashOrCard: TranslationPathOrText = {translationPath: isTransactionMadeWithCard ? 'iou.card' : 'iou.cash'};
    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);
    const hasViolationsOfTypeNotice = hasNoticeTypeViolation(transaction?.transactionID, violations, true) && isPaidGroupPolicy(iouReport);
    const hasActionWithErrors = hasActionsWithErrors(iouReport?.reportID);

    const {amount: requestAmount, currency: requestCurrency} = transactionDetails;

    let RBRMessage: TranslationPathOrText | undefined;

    if (!shouldShowRBR || !transaction) {
        RBRMessage = {text: ''};
    }

    if (shouldShowHoldMessage && RBRMessage === undefined) {
        RBRMessage = {translationPath: 'iou.expenseWasPutOnHold'};
    }

    const path = getViolationTranslatePath(violations, hasFieldErrors, violationMessage ?? '', isTransactionOnHold);
    if (path.translationPath === 'violations.reviewRequired' || (RBRMessage === undefined && violationMessage)) {
        RBRMessage = path;
    }

    if (hasFieldErrors && RBRMessage === undefined) {
        const merchantMissing = isMerchantMissing(transaction);
        const amountMissing = isAmountMissing(transaction);
        if (amountMissing && merchantMissing) {
            RBRMessage = {translationPath: 'violations.reviewRequired'};
        } else if (amountMissing) {
            RBRMessage = {translationPath: 'iou.missingAmount'};
        } else if (merchantMissing) {
            RBRMessage = {translationPath: 'iou.missingMerchant'};
        }
    }

    if (RBRMessage === undefined && hasActionWithErrors) {
        const actionsWithErrors = getUniqueActionErrors(iouReport);
        RBRMessage = actionsWithErrors.length > 1 ? {translationPath: 'violations.reviewRequired'} : {text: actionsWithErrors.at(0)};
    }

    RBRMessage ??= {text: ''};

    let previewHeaderText: TranslationPathOrText[] = [showCashOrCard];

    if (isDistanceRequest(transaction)) {
        previewHeaderText = [{translationPath: 'common.distance'}];
    } else if (isPerDiemRequest(transaction)) {
        previewHeaderText = [{translationPath: 'common.perDiem'}];
    } else if (isScanning) {
        previewHeaderText = [{translationPath: 'common.receipt'}];
    } else if (isBillSplit) {
        previewHeaderText = [{translationPath: 'iou.split'}];
    }

    if (!isCreatedMissing(transaction)) {
        const created = getFormattedCreated(transaction);
        const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
        previewHeaderText.unshift({text: date}, dotSeparator);
    }

    if (isPending(transaction)) {
        previewHeaderText.push(dotSeparator, {translationPath: 'iou.pending'});
    }

    if (hasPendingRTERViolation(violations)) {
        previewHeaderText.push(dotSeparator, {translationPath: 'iou.pendingMatch'});
    }

    let isPreviewHeaderTextComplete = false;

    if (isMoneyRequestSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
        previewHeaderText.push(dotSeparator, {translationPath: isTransactionMadeWithCard ? 'common.done' : 'iou.settledExpensify'});
        isPreviewHeaderTextComplete = true;
    }

    if (!isPreviewHeaderTextComplete) {
        if (hasViolationsOfTypeNotice && transaction && !isReportApproved({report: iouReport}) && !isSettled(iouReport?.reportID)) {
            previewHeaderText.push(dotSeparator, {translationPath: 'violations.reviewRequired'});
        } else if (isPaidGroupPolicyExpenseReport(iouReport) && isReportApproved({report: iouReport}) && !isSettled(iouReport?.reportID) && !isPartialHold) {
            previewHeaderText.push(dotSeparator, {translationPath: 'iou.approved'});
        } else if (iouReport?.isCancelledIOU) {
            previewHeaderText.push(dotSeparator, {translationPath: 'iou.canceled'});
        } else if (shouldShowHoldMessage) {
            previewHeaderText.push(dotSeparator, {translationPath: 'violations.hold'});
        }
    }

    const amount = isBillSplit ? getOriginalTransactionIfBillIsSplit(transaction).originalTransaction?.amount : requestAmount;
    let displayAmountText: TranslationPathOrText = isScanning ? {translationPath: 'iou.receiptStatusTitle'} : {text: convertToDisplayString(amount, requestCurrency)};
    if (isFetchingWaypoints && !requestAmount) {
        displayAmountText = {translationPath: 'iou.fieldPending'};
    }

    const iouOriginalMessage: OnyxEntry<OnyxTypes.OriginalMessageIOU> = isMoneyRequestAction(action) ? getOriginalMessage(action) ?? undefined : undefined;
    const displayDeleteAmountText: TranslationPathOrText = {text: convertToDisplayString(iouOriginalMessage?.amount, iouOriginalMessage?.currency)};

    return {
        RBRMessage,
        displayAmountText,
        displayDeleteAmountText,
        previewHeaderText,
    };
}

function createTransactionPreviewConditionals({
    iouReport,
    transaction,
    action,
    violations,
    transactionDetails,
    isBillSplit,
    isReportAPolicyExpenseChat,
    areThereDuplicates,
}: {
    iouReport: OnyxInputValue<OnyxTypes.Report> | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction> | undefined;
    action: OnyxEntry<OnyxTypes.ReportAction>;
    violations: OnyxTypes.TransactionViolations;
    transactionDetails: Partial<TransactionDetails>;
    isBillSplit: boolean;
    isReportAPolicyExpenseChat: boolean;
    areThereDuplicates: boolean;
}) {
    const {amount: requestAmount, comment: requestComment, merchant, tag, category} = transactionDetails;

    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);

    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});

    const isMoneyRequestSettled = isSettled(iouReport?.reportID);
    const isApproved = isReportApproved({report: iouReport});
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;

    const hasViolationsOfTypeNotice = hasNoticeTypeViolation(transaction?.transactionID, violations, true) && iouReport && isPaidGroupPolicy(iouReport);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);

    const isFetchingWaypoints = isFetchingWaypointsFromServer(transaction);

    const isTransactionOnHold = isOnHold(transaction);
    const isFullySettled = isMoneyRequestSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    const shouldShowSkeleton = isEmptyObject(transaction) && !isMessageDeleted(action) && action?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowTag = !!tag && isReportAPolicyExpenseChat;
    const shouldShowCategory = !!category && isReportAPolicyExpenseChat;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasAnyViolations = hasViolationsOfTypeNotice || hasWarningTypeViolation(transaction?.transactionID, violations, true) || hasViolation(transaction, violations, true);
    const hasErrorOrOnHold = hasFieldErrors || (!isFullySettled && !isFullyApproved && isTransactionOnHold);
    const hasReportViolationsOrActionErrors = (isReportOwner(iouReport) && hasReportViolations(iouReport?.reportID)) || hasActionsWithErrors(iouReport?.reportID);
    const shouldShowRBR = hasAnyViolations || hasErrorOrOnHold || hasReportViolationsOrActionErrors;

    // When there are no settled transactions in duplicates, show the "Keep this one" button
    const shouldShowKeepButton = areThereDuplicates;
    const shouldShowSplitShare = isBillSplit && !!requestAmount && requestAmount > 0;

    /*
 Show the merchant for IOUs and expenses only if:
 - the merchant is not empty, is custom, or is not related to scanning smartscan;
 - the expense is not a distance expense with a pending route and amount = 0 - in this case,
   the merchant says: "Route pending...", which is already shown in the amount field;
*/
    const shouldShowMerchant =
        !!requestMerchant &&
        requestMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT &&
        requestMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT &&
        !(isFetchingWaypoints && !requestAmount);
    const shouldShowDescription = !!description && !shouldShowMerchant && !isScanning;

    return {
        shouldShowSkeleton,
        shouldShowTag,
        shouldShowRBR,
        shouldShowCategory,
        shouldShowKeepButton,
        shouldShowSplitShare,
        shouldShowMerchant,
        shouldShowDescription,
    };
}

export {
    getReviewNavigationRoute,
    getIOUData,
    getTransactionPreviewTextAndTranslationPaths,
    createTransactionPreviewConditionals,
    getOriginalTransactionIfBillIsSplit,
    getViolationTranslatePath,
    getUniqueActionErrors,
};
export type {TranslationPathOrText};
