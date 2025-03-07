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
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import type {TransactionDetails} from './ReportUtils';
import StringUtils from './StringUtils';
import * as TransactionUtils from './TransactionUtils';
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
        isIOU: reportID ? ReportUtils.isIOUReport(reportID) : false,
    };
}

const navigateToReviewFields = (
    route: PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, 'Transaction_Duplicate_Review'>,
    report: OnyxEntry<OnyxTypes.Report>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    duplicates: string[],
) => {
    const backTo = route.params.backTo;

    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID, report?.parentReportActionID);
    const reviewingTransactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    // Clear the draft before selecting a different expense to prevent merging fields from the previous expense
    // (e.g., category, tag, tax) that may be not enabled/available in the new expense's policy.
    abandonReviewDuplicateTransactions();
    const comparisonResult = TransactionUtils.compareDuplicateTransactionFields(reviewingTransactionID, transaction?.reportID, transaction?.transactionID ?? reviewingTransactionID);
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
    const isFetchingWaypointsFromServer = TransactionUtils.isFetchingWaypointsFromServer(transaction);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const isSettled = ReportUtils.isSettled(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isOnHold;
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isPerDiemRequest = TransactionUtils.isPerDiemRequest(transaction);
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const isScanning = hasReceipt && TransactionUtils.isReceiptBeingScanned(transaction);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(transaction);
    const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(action);
    const hasNoticeTypeViolations = TransactionUtils.hasNoticeTypeViolation(transaction?.transactionID, violations, true) && ReportUtils.isPaidGroupPolicy(iouReport);

    const {amount: requestAmount, currency: requestCurrency} = transactions;

    const getSettledMessage = (): string => {
        if (isCardTransaction) {
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
            const canEdit = isMoneyRequestAction && ReportUtils.canEditMoneyRequest(action, transaction);
            const violationMessage = ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit);
            const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
            const isTooLong = violationsCount > 1 || violationMessage.length > 15;
            const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

            return isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage;
        }

        if (hasFieldErrors) {
            const isMerchantMissing = TransactionUtils.isMerchantMissing(transaction);
            const isAmountMissing = TransactionUtils.isAmountMissing(transaction);
            if (isAmountMissing && isMerchantMissing) {
                return translate('violations.reviewRequired');
            }
            if (isAmountMissing) {
                return translate('iou.missingAmount');
            }
            if (isMerchantMissing) {
                return translate('iou.missingMerchant');
            }
        }

        return '';
    };

    const getPreviewHeaderText = (): string => {
        let message = showCashOrCard;

        if (isDistanceRequest) {
            message = translate('common.distance');
        } else if (isPerDiemRequest) {
            message = translate('common.perDiem');
        } else if (isScanning) {
            message = translate('common.receipt');
        } else if (isBillSplit) {
            message = translate('iou.split');
        }

        if (!TransactionUtils.isCreatedMissing(transaction)) {
            const created = TransactionUtils.getFormattedCreated(transaction);
            const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
            message = `${date} ${CONST.DOT_SEPARATOR} ${message}`;
        }

        if (TransactionUtils.isPending(transaction)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }

        if (TransactionUtils.hasPendingRTERViolation(violations)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        if (isSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            return message;
        }

        if (hasNoticeTypeViolations && transaction && !ReportUtils.isReportApproved({report: iouReport}) && !ReportUtils.isSettled(iouReport?.reportID)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
        } else if (
            ReportUtils.isPaidGroupPolicyExpenseReport(iouReport) &&
            ReportUtils.isReportApproved({report: iouReport}) &&
            !ReportUtils.isSettled(iouReport?.reportID) &&
            !isPartialHold
        ) {
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

        if (isFetchingWaypointsFromServer && !requestAmount) {
            return translate('iou.fieldPending');
        }

        return convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = (): string => {
        const iouOriginalMessage: OnyxEntry<OnyxTypes.OriginalMessageIOU> = ReportActionsUtils.isMoneyRequestAction(action)
            ? ReportActionsUtils.getOriginalMessage(action) ?? undefined
            : undefined;
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
    isPolicyExpenseChat,
    areThereDuplicates,
}: {
    iouReport: OnyxInputValue<OnyxTypes.Report> | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    translate: LocaleContextProps['translate'];
    action: OnyxTypes.ReportAction;
    violations: OnyxTypes.TransactionViolations;
    transactions: Partial<TransactionDetails>;
    isBillSplit: boolean;
    isPolicyExpenseChat: boolean;
    areThereDuplicates: boolean;
}) {
    const {amount: requestAmount, comment: requestComment, merchant, tag, category} = transactions;

    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const isScanning = hasReceipt && TransactionUtils.isReceiptBeingScanned(transaction);

    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});

    const isSettled = ReportUtils.isSettled(iouReport?.reportID);
    const isApproved = ReportUtils.isReportApproved({report: iouReport});
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;

    const hasViolations = TransactionUtils.hasViolation(transaction, violations, true);
    const hasNoticeTypeViolations = TransactionUtils.hasNoticeTypeViolation(transaction?.transactionID, violations, true) && iouReport && ReportUtils.isPaidGroupPolicy(iouReport);
    const hasWarningTypeViolations = TransactionUtils.hasWarningTypeViolation(transaction?.transactionID, violations, true);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(transaction);

    const isFetchingWaypointsFromServer = TransactionUtils.isFetchingWaypointsFromServer(transaction);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);

    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isFullySettled = isSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const shouldShowSkeleton = isEmptyObject(transaction) && !ReportActionsUtils.isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowTag = !!tag && isPolicyExpenseChat;
    const shouldShowCategory = !!category && isPolicyExpenseChat;
    const shouldShowRBR = (hasNoticeTypeViolations ?? hasWarningTypeViolations) || hasViolations || hasFieldErrors || (!isFullySettled && !isFullyApproved && isOnHold);
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
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
        !(isFetchingWaypointsFromServer && !requestAmount);
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
