import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TransactionPreviewProps} from '@components/ReportActionItem/TransactionPreview/types';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {calculateAmount} from '@libs/IOUUtils';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {createTransactionPreviewConditionals, createTransactionPreviewText, getIOUData} from '@libs/TransactionPreviewUtils';
import {hasReceipt as hasReceiptTransactionUtils, isReceiptBeingScanned} from '@libs/TransactionUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

function useTransactionPreviewData(
    {isBillSplit, action, chatReportID, reportID, onPreviewPressed, containerStyles, isHovered = false, isWhisper = false, iouReportID}: TransactionPreviewProps,
    translate: LocaleContextProps['translate'],
    route: PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>,
    areThereDuplicates: boolean,
) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(action);
    const transactionID = isMoneyRequestAction ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID : null;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const violations = useTransactionViolations(transaction?.transactionID);

    const transactions = useMemo<Partial<TransactionDetails>>(() => ReportUtils.getTransactionDetails(transaction) ?? {}, [transaction]);
    const {amount: requestAmount, comment: requestComment, merchant, tag, category, currency: requestCurrency} = transactions;
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);

    const creationalData = useMemo(
        () => ({
            iouReport,
            transaction,
            translate,
            action,
            isBillSplit,
            violations,
            transactions,
        }),
        [action, iouReport, isBillSplit, transaction, transactions, translate, violations],
    );

    const conditionalProps = useMemo(
        () =>
            createTransactionPreviewConditionals({
                ...creationalData,
                areThereDuplicates,
                isPolicyExpenseChat,
            }),
        [areThereDuplicates, creationalData, isPolicyExpenseChat],
    );

    const {shouldShowRBR, shouldShowMerchant, shouldShowSplitShare} = conditionalProps;

    const {RBRmessage, displayAmountText, displayDeleteAmountText, previewHeaderText} = useMemo(
        () =>
            createTransactionPreviewText({
                ...creationalData,
                shouldShowRBR,
            }),
        [creationalData, shouldShowRBR],
    );

    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const participantAccountIDs =
        ReportActionsUtils.isMoneyRequestAction(action) && isBillSplit ? ReportActionsUtils.getOriginalMessage(action)?.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(ReportUtils.getWorkspaceIcon(chatReport));
    }

    const sessionAccountID = session?.accountID;

    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount ?? 0, requestCurrency ?? '', action.actorAccountID === sessionAccountID)
                : 0,
        [shouldShowSplitShare, isPolicyExpenseChat, action.actorAccountID, participantAccountIDs.length, transaction?.comment?.splits, requestAmount, requestCurrency, sessionAccountID],
    );

    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = hasReceiptTransactionUtils(transaction);

    const {from, to, isIOU} = getIOUData(managerID, ownerAccountID, reportID, personalDetails, (transaction && transaction.amount) ?? 0);

    return {
        isApproved: ReportUtils.isReportApproved({report: iouReport}),
        isSettled: ReportUtils.isSettled(iouReport?.reportID),
        isSettlementOrApprovalPartial: !!iouReport?.pendingFields?.partial,
        isScanning: hasReceipt && isReceiptBeingScanned(transaction),
        displayAmount: isDeleted ? displayDeleteAmountText : displayAmountText,
        receiptImages: [{...getThumbnailAndImageURIs(transaction), transaction}],
        merchantOrDescription: shouldShowMerchant ? requestMerchant : description || '',
        isReviewDuplicateTransactionPage: route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW,
        walletTermsErrors: walletTerms?.errors,
        sortedParticipantAvatars,
        splitShare,
        isDeleted,
        RBRmessage,
        previewHeaderText,
        requestAmount,
        requestCurrency,
        tag,
        category,
        isWhisper,
        isHovered,
        isBillSplit,
        onPreviewPressed,
        containerStyles,
        from,
        to,
        isIOU,
        ...conditionalProps,
    };
}

export default useTransactionPreviewData;
