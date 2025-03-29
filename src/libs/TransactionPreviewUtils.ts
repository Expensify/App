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
import {getOriginalMessage, getReportAction, isMessageDeleted, isMoneyRequestAction} from './ReportActionsUtils';
import {isIOUReport, isPaidGroupPolicy, isPaidGroupPolicyExpenseReport, isReportApproved, isSettled} from './ReportUtils';
import type {TransactionDetails} from './ReportUtils';
import StringUtils from './StringUtils';
import {
    compareDuplicateTransactionFields,
    getFormattedCreated,
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

const chooseIDBasedOnAmount = (amount: number, negativeId: number, positiveId: number) => (amount < 0 ? negativeId : positiveId);

function getIOUData(
    managerID: number,
    ownerAccountID: number,
    reportOrID: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report> | string | undefined,
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    amount: number,
) {
    const fromID = chooseIDBasedOnAmount(amount, managerID, ownerAccountID);
    const toID = chooseIDBasedOnAmount(amount, ownerAccountID, managerID);

    return reportOrID && isIOUReport(reportOrID)
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

    const {amount: requestAmount, currency: requestCurrency} = transactionDetails;

    let RBRMessage: TranslationPathOrText | undefined;

    if (!shouldShowRBR || !transaction) {
        RBRMessage = {text: ''};
    }

    if (shouldShowHoldMessage && RBRMessage === undefined) {
        RBRMessage = {translationPath: 'iou.expenseWasPutOnHold'};
    }

    if (violationMessage && RBRMessage === undefined) {
        const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
        const isTooLong = violationsCount > 1 || violationMessage.length > 15;
        const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

        RBRMessage = isTooLong || hasViolationsAndFieldErrors ? {translationPath: 'violations.reviewRequired'} : {text: violationMessage};
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

    if (shouldShowRBR && transaction) {
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

    let displayAmountText: TranslationPathOrText = isScanning ? {translationPath: 'iou.receiptStatusTitle'} : {text: convertToDisplayString(requestAmount, requestCurrency)};
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
        showCashOrCard,
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

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const shouldShowSkeleton = isEmptyObject(transaction) && !isMessageDeleted(action) && action?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowTag = !!tag && isReportAPolicyExpenseChat;
    const shouldShowCategory = !!category && isReportAPolicyExpenseChat;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasAnyViolations = hasViolationsOfTypeNotice || hasWarningTypeViolation(transaction?.transactionID, violations, true) || hasViolation(transaction, violations, true);
    const hasErrorOrOnHold = hasFieldErrors || (!isFullySettled && !isFullyApproved && isTransactionOnHold);
    const shouldShowRBR = hasAnyViolations || hasErrorOrOnHold;

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
        shouldDisableOnPress,
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

export {getReviewNavigationRoute, getIOUData, getTransactionPreviewTextAndTranslationPaths, createTransactionPreviewConditionals};
export type {TranslationPathOrText};
