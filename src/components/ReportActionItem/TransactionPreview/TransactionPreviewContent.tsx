import {useRoute} from '@react-navigation/native';
import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {calculateAmount} from '@libs/IOUUtils';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, getReportAction, isMessageDeleted, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {
    canEditMoneyRequest,
    getTransactionDetails,
    getWorkspaceIcon,
    isPaidGroupPolicy,
    isPaidGroupPolicyExpenseReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isReportApproved,
    isSettled as isSettledReportUtils,
} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    compareDuplicateTransactionFields,
    getFormattedCreated,
    hasMissingSmartscanFields,
    hasNoticeTypeViolation as hasNoticeTypeViolationTransactionUtils,
    hasPendingRTERViolation,
    hasReceipt as hasReceiptTransactionUtils,
    hasViolation as hasViolationTransactionUtils,
    hasWarningTypeViolation as hasWarningTypeViolationTransactionUtils,
    isAmountMissing as isAmountMissingTransactionUtils,
    isCardTransaction as isCardTransactionTransactionUtils,
    isCreatedMissing,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isFetchingWaypointsFromServer as isFetchingWaypointsFromServerTransactionUtils,
    isMerchantMissing as isMerchantMissingTransactionUtils,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isReceiptBeingScanned,
    removeSettledAndApprovedTransactions,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import {abandonReviewDuplicateTransactions, setReviewDuplicatesKey} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import TransactionPreviewContentUI from './TransactionPreviewContentUI';
import type {TransactionPreviewProps} from './types';

function TransactionPreviewContent({
    isBillSplit,
    action,
    contextMenuAnchor,
    chatReportID,
    reportID,
    onPreviewPressed,
    containerStyles,
    checkIfContextMenuActive = () => {},
    isHovered = false,
    isWhisper = false,
    shouldDisplayContextMenu = true,
    iouReportID,
}: TransactionPreviewProps) {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);

    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const violations = useTransactionViolations(transaction?.transactionID);

    const sessionAccountID = session?.accountID;
    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);

    const participantAccountIDs = isMoneyRequestActionReportActionsUtils(action) && isBillSplit ? getOriginalMessage(action)?.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(getWorkspaceIcon(chatReport));
    }

    const {
        amount: requestAmount,
        currency: requestCurrency,
        comment: requestComment,
        merchant,
        tag,
        category,
    } = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);

    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const isScanning = hasReceipt && isReceiptBeingScanned(transaction);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isOnHold;
    const hasViolations = hasViolationTransactionUtils(transaction, violations, true);
    const hasNoticeTypeViolations = hasNoticeTypeViolationTransactionUtils(transaction?.transactionID, violations, true) && isPaidGroupPolicy(iouReport);
    const hasWarningTypeViolations = hasWarningTypeViolationTransactionUtils(transaction?.transactionID, violations, true);

    const hasFieldErrors = hasMissingSmartscanFields(transaction);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const isFetchingWaypointsFromServer = isFetchingWaypointsFromServerTransactionUtils(transaction);
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);
    const isSettled = isSettledReportUtils(iouReport?.reportID);
    const isApproved = isReportApproved({report: iouReport});
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isReviewDuplicateTransactionPage = route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW;

    const isFullySettled = isSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);

    // Remove settled transactions from duplicates
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);

    // When there are no settled transactions in duplicates, show the "Keep this one" button
    const shouldShowKeepButton = !!(allDuplicates.length && duplicates.length && allDuplicates.length === duplicates.length);

    const shouldShowTag = !!tag && isPolicyExpenseChat;
    const shouldShowCategory = !!category && isPolicyExpenseChat;
    const shouldShowRBR = hasNoticeTypeViolations || hasWarningTypeViolations || hasViolations || hasFieldErrors || (!isFullySettled && !isFullyApproved && isOnHold);
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`);
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const reviewingTransactionID = isMoneyRequestActionReportActionsUtils(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

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

    let merchantOrDescription = requestMerchant;
    if (!shouldShowMerchant) {
        merchantOrDescription = description || '';
    }

    const receiptImages = [{...getThumbnailAndImageURIs(transaction), transaction}];

    const getSettledMessage = (): string => {
        if (isCardTransaction) {
            return translate('common.done');
        }
        return translate('iou.settledExpensify');
    };

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchor, reportID, action, checkIfContextMenuActive);
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
            const canEdit = isMoneyRequestAction && canEditMoneyRequest(action, transaction);
            const violationMessage = ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit);
            const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
            const isTooLong = violationsCount > 1 || violationMessage.length > 15;
            const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

            return isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage;
        }

        if (hasFieldErrors) {
            const isMerchantMissing = isMerchantMissingTransactionUtils(transaction);
            const isAmountMissing = isAmountMissingTransactionUtils(transaction);
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

        if (isSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            return message;
        }

        if (hasNoticeTypeViolations && transaction && !isReportApproved({report: iouReport}) && !isSettledReportUtils(iouReport?.reportID)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
        } else if (isPaidGroupPolicyExpenseReport(iouReport) && isReportApproved({report: iouReport}) && !isSettledReportUtils(iouReport?.reportID) && !isPartialHold) {
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
        const iouOriginalMessage: OnyxEntry<OriginalMessageIOU> = isMoneyRequestActionReportActionsUtils(action) ? getOriginalMessage(action) ?? undefined : undefined;
        return convertToDisplayString(iouOriginalMessage?.amount, iouOriginalMessage?.currency);
    };

    const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();

    const shouldShowSplitShare = isBillSplit && !!requestAmount && requestAmount > 0;

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount, requestCurrency ?? '', action.actorAccountID === sessionAccountID)
                : 0,
        [shouldShowSplitShare, isPolicyExpenseChat, action.actorAccountID, participantAccountIDs.length, transaction?.comment?.splits, requestAmount, requestCurrency, sessionAccountID],
    );

    const navigateToReviewFields = () => {
        const backTo = route.params.backTo;

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

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const shouldShowSkeleton = isEmptyObject(transaction) && !isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const previewHeaderText = getPreviewHeaderText();
    const RBRmessage = getRBRmessage();
    const offlineWithFeedbackOnClose = useCallback(() => {
        clearWalletTermsError();
        clearIOUError(chatReportID);
    }, [chatReportID]);

    return (
        <TransactionPreviewContentUI
            isDeleted={isDeleted}
            isScanning={isScanning}
            isWhisper={isWhisper}
            isHovered={isHovered}
            isSettled={isSettled}
            isBillSplit={isBillSplit}
            isApproved={isApproved}
            isSettlementOrApprovalPartial={isSettlementOrApprovalPartial}
            isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}
            shouldShowSkeleton={shouldShowSkeleton}
            shouldShowRBR={shouldShowRBR}
            shouldDisableOnPress={shouldDisableOnPress}
            shouldShowKeepButton={shouldShowKeepButton}
            shouldShowDescription={shouldShowDescription}
            shouldShowMerchant={shouldShowMerchant}
            shouldShowCategory={shouldShowCategory}
            shouldShowTag={shouldShowTag}
            displayAmount={displayAmount}
            category={category}
            showCashOrCard={showCashOrCard}
            tag={tag}
            RBRmessage={RBRmessage}
            requestCurrency={requestCurrency}
            merchantOrDescription={merchantOrDescription}
            previewHeaderText={previewHeaderText}
            requestAmount={requestAmount}
            splitShare={splitShare}
            receiptImages={receiptImages}
            sortedParticipantAvatars={sortedParticipantAvatars}
            walletTermsErrors={walletTerms?.errors}
            pendingAction={action.pendingAction}
            showContextMenu={showContextMenu}
            offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
            translate={translate}
            navigateToReviewFields={navigateToReviewFields}
            onPreviewPressed={onPreviewPressed}
            containerStyles={containerStyles}
        />
    );
}

TransactionPreviewContent.displayName = 'TransactionPreviewContent';

export default TransactionPreviewContent;
