import truncate from 'lodash/truncate';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {abandonReviewDuplicateTransactions, setReviewDuplicatesKey} from './actions/Transaction';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import Navigation from './Navigation/Navigation';
import type {PlatformStackRouteProp} from './Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from './Navigation/types';
import {getOriginalMessage, getReportAction, isMessageDeleted, isMoneyRequestAction} from './ReportActionsUtils';
import {canEditMoneyRequest, isIOUReport, isPaidGroupPolicy, isPaidGroupPolicyExpenseReport, isReportApproved, isSettled} from './ReportUtils';
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
import ViolationsUtils from './Violations/ViolationsUtils';

const emptyPersonalDetails: OnyxTypes.PersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

const chooseIdBasedOnAmount = (amount: number, negativeId: number, positiveId: number) => (amount < 0 ? negativeId : positiveId);

function getIOUData(managerID: number, ownerAccountID: number, reportID: string | undefined, personalDetails: OnyxTypes.PersonalDetailsList | undefined, amount: number) {
    const fromID = chooseIdBasedOnAmount(amount, managerID, ownerAccountID);
    const toID = chooseIdBasedOnAmount(amount, ownerAccountID, managerID);

    return {
        from: personalDetails ? personalDetails[fromID] : emptyPersonalDetails,
        to: personalDetails ? personalDetails[toID] : emptyPersonalDetails,
        isIOU: reportID ? isIOUReport(reportID) : false,
    };
}

const navigateToReviewFields = (
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

    if ('merchant' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('category' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('tag' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('description' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('taxCode' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('billable' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else if ('reimbursable' in comparisonResult.change) {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
    } else {
        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(route.params?.threadReportID, backTo));
    }
};

function createTransactionPreviewText({
    iouReport,
    transaction,
    translate,
    action,
    violations,
    transactions,
    isBillSplit,
    shouldShowRBR,
}: {
    iouReport: OnyxEntry<OnyxTypes.Report>;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    translate: LocaleContextProps['translate'];
    action: OnyxTypes.ReportAction;
    violations: OnyxTypes.TransactionViolations;
    transactions: Partial<TransactionDetails>;
    isBillSplit: boolean;
    shouldShowRBR: boolean;
}) {
    const isFetchingWaypoints = isFetchingWaypointsFromServer(transaction);
    const isTransactionOnHold = isOnHold(transaction);
    const isTransactionMadeWithCard = isCardTransaction(transaction);
    const isMoneyRequestSettled = isSettled(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isTransactionOnHold;
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isMoneyRequestSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;
    const showCashOrCard = isTransactionMadeWithCard ? translate('iou.card') : translate('iou.cash');
    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);
    const isIOUActionType = isMoneyRequestAction(action);
    const hasViolationsOfTypeNotice = hasNoticeTypeViolation(transaction?.transactionID, violations, true) && isPaidGroupPolicy(iouReport);

    const {amount: requestAmount, currency: requestCurrency} = transactions;

    const getSettledMessage = (): string => {
        if (isTransactionMadeWithCard) {
            return translate('common.done');
        }
        return translate('iou.settledExpensify');
    };

    const getRBRmessage = () => {
        if (!shouldShowRBR || !transaction) {
            return '';
        }

        if (shouldShowHoldMessage) {
            return translate('violations.hold');
        }

        const firstViolation = violations?.at(0);

        if (firstViolation) {
            const canEdit = isIOUActionType && canEditMoneyRequest(action, transaction);
            const violationMessage = ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit);
            const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
            const isTooLong = violationsCount > 1 || violationMessage.length > 15;
            const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

            return isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage;
        }

        if (hasFieldErrors) {
            const merchantMissing = isMerchantMissing(transaction);
            const amountMissing = isAmountMissing(transaction);
            if (amountMissing && merchantMissing) {
                return translate('violations.reviewRequired');
            }
            if (amountMissing) {
                return translate('iou.missingAmount');
            }
            if (merchantMissing) {
                return translate('iou.missingMerchant');
            }
        }

        return '';
    };

    const getPreviewHeaderText = (): string => {
        let message = showCashOrCard;

        if (isDistanceRequest(transaction)) {
            message = translate('common.distance');
        } else if (isPerDiemRequest(transaction)) {
            message = translate('common.perDiem');
        } else if (isScanning) {
            message = translate('common.receipt');
        } else if (isBillSplit) {
            message = translate('iou.split');
        }

        if (!isCreatedMissing(transaction)) {
            const created = getFormattedCreated(transaction);
            const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
            message = `${date} ${CONST.DOT_SEPARATOR} ${message}`;
        }

        if (isPending(transaction)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }

        if (hasPendingRTERViolation(violations)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        if (isMoneyRequestSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            return message;
        }

        if (hasViolationsOfTypeNotice && transaction && !isReportApproved({report: iouReport}) && !isSettled(iouReport?.reportID)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
        } else if (isPaidGroupPolicyExpenseReport(iouReport) && isReportApproved({report: iouReport}) && !isSettled(iouReport?.reportID) && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (iouReport?.isCancelledIOU) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (shouldShowHoldMessage) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.hold')}`;
        }
        return message;
    };

    const getDisplayAmountText = (): string => {
        if (isScanning) {
            return translate('iou.receiptStatusTitle');
        }

        if (isFetchingWaypoints && !requestAmount) {
            return translate('iou.fieldPending');
        }

        return convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = (): string => {
        const iouOriginalMessage: OnyxEntry<OnyxTypes.OriginalMessageIOU> = isMoneyRequestAction(action) ? getOriginalMessage(action) ?? undefined : undefined;
        return convertToDisplayString(iouOriginalMessage?.amount, iouOriginalMessage?.currency);
    };

    // const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();
    return {
        RBRmessage: getRBRmessage(),
        displayAmountText: getDisplayAmountText(),
        displayDeleteAmountText: getDisplayDeleteAmountText(),
        previewHeaderText: getPreviewHeaderText(),
    };
}

function createTransactionPreviewConditionals({
    iouReport,
    transaction,
    translate,
    action,
    violations,
    transactions,
    isBillSplit,
    isReportAPolicyExpenseChat,
    areThereDuplicates,
}: {
    iouReport: OnyxInputValue<OnyxTypes.Report> | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction> | undefined;
    translate: LocaleContextProps['translate'];
    action: OnyxTypes.ReportAction;
    violations: OnyxTypes.TransactionViolations;
    transactions: Partial<TransactionDetails>;
    isBillSplit: boolean;
    isReportAPolicyExpenseChat: boolean;
    areThereDuplicates: boolean;
}) {
    const {amount: requestAmount, comment: requestComment, merchant, tag, category} = transactions;

    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);

    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});

    const isMoneyRequestSettled = isSettled(iouReport?.reportID);
    const isApproved = isReportApproved({report: iouReport});
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;

    const hasViolationsOfTypeNotice = hasNoticeTypeViolation(transaction?.transactionID, violations, true) && iouReport && isPaidGroupPolicy(iouReport);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);

    const isFetchingWaypoints = isFetchingWaypointsFromServer(transaction);
    const isTransactionMadeWithCard = isCardTransaction(transaction);

    const isTransactionOnHold = isOnHold(transaction);
    const isFullySettled = isMoneyRequestSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const shouldShowSkeleton = isEmptyObject(transaction) && !isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowTag = !!tag && isReportAPolicyExpenseChat;
    const shouldShowCategory = !!category && isReportAPolicyExpenseChat;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasAnyViolations = hasViolationsOfTypeNotice || hasWarningTypeViolation(transaction?.transactionID, violations, true) || hasViolation(transaction, violations, true);
    const hasErrorOrOnHold = hasFieldErrors || (!isFullySettled && !isFullyApproved && isTransactionOnHold);
    const shouldShowRBR = hasAnyViolations || hasErrorOrOnHold;

    const showCashOrCard = isTransactionMadeWithCard ? translate('iou.card') : translate('iou.cash');
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
        showCashOrCard,
        shouldShowRBR,
        shouldShowCategory,
        shouldShowKeepButton,
        shouldShowSplitShare,
        shouldShowMerchant,
        shouldShowDescription,
    };
}

export {navigateToReviewFields, getIOUData, createTransactionPreviewText, createTransactionPreviewConditionals};
