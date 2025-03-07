import {useRoute} from '@react-navigation/native';
import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useTransactionPreviewConditionals from '@hooks/useTransactionPreviewConditionals';
import useTransactionPreviewText from '@hooks/useTransactionPreviewText';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getIOUData, navigateToReviewFields} from '@libs/desktopLoginRedirect/TransactionPreviewUtils';
import {calculateAmount} from '@libs/IOUUtils';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {getTransactionDetails, getWorkspaceIcon, isPolicyExpenseChat as isPolicyExpenseChatReportUtils, isReportApproved, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {hasReceipt as hasReceiptTransactionUtils, isReceiptBeingScanned, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import TransactionPreviewContent from './TransactionPreviewContent';
import type {TransactionPreviewProps} from './types';

function TransactionPreview({
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
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`);

    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const violations = useTransactionViolations(transaction?.transactionID);

    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(chatReport);
    const conditionalProps = useTransactionPreviewConditionals({iouReport, transaction, translate, action, isPolicyExpenseChat, isBillSplit, violations});
    const {shouldShowRBR, shouldShowMerchant, shouldShowSplitShare} = conditionalProps;
    const {RBRmessage, displayAmountText, displayDeleteAmountText, previewHeaderText} = useTransactionPreviewText({
        iouReport,
        transaction,
        translate,
        action,
        shouldShowRBR,
        isBillSplit,
        violations,
    });

    const sessionAccountID = session?.accountID;
    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;

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
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);

    const participantAccountIDs = isMoneyRequestActionReportActionsUtils(action) && isBillSplit ? getOriginalMessage(action)?.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(getWorkspaceIcon(chatReport));
    }

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchor, reportID, action, checkIfContextMenuActive);
    };

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount ?? 0, requestCurrency ?? '', action.actorAccountID === sessionAccountID)
                : 0,
        [shouldShowSplitShare, isPolicyExpenseChat, action.actorAccountID, participantAccountIDs.length, transaction?.comment?.splits, requestAmount, requestCurrency, sessionAccountID],
    );

    const offlineWithFeedbackOnClose = useCallback(() => {
        clearWalletTermsError();
        clearIOUError(chatReportID);
    }, [chatReportID]);

    const navigate = useCallback(() => {
        navigateToReviewFields(route, report, transaction, duplicates);
    }, [duplicates, report, route, transaction]);

    const transactionPreviewContentUIProps = {
        isApproved: isReportApproved({report: iouReport}),
        isSettled: isSettledReportUtils(iouReport?.reportID),
        isSettlementOrApprovalPartial: !!iouReport?.pendingFields?.partial,
        isScanning: hasReceipt && isReceiptBeingScanned(transaction),
        displayAmount: isDeleted ? displayDeleteAmountText : displayAmountText,
        receiptImages: [{...getThumbnailAndImageURIs(transaction), transaction}],
        merchantOrDescription: shouldShowMerchant ? requestMerchant : description || '',
        isReviewDuplicateTransactionPage: route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW,
        ...getIOUData(managerID, ownerAccountID, reportID, personalDetails, (transaction && transaction.amount) ?? 0),
        ...conditionalProps,
    };

    return (
        <TransactionPreviewContent
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...transactionPreviewContentUIProps}
            isDeleted={isDeleted}
            isWhisper={isWhisper}
            isHovered={isHovered}
            isBillSplit={isBillSplit}
            category={category}
            tag={tag}
            RBRmessage={RBRmessage}
            requestCurrency={requestCurrency}
            previewHeaderText={previewHeaderText}
            requestAmount={requestAmount}
            splitShare={splitShare}
            sortedParticipantAvatars={sortedParticipantAvatars}
            walletTermsErrors={walletTerms?.errors}
            pendingAction={action.pendingAction}
            navigateToReviewFields={navigate}
            onPreviewPressed={onPreviewPressed}
            containerStyles={containerStyles}
            showContextMenu={showContextMenu}
            offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
            translate={translate}
        />
    );
}

TransactionPreview.displayName = 'TransactionPreview';

export default TransactionPreview;
