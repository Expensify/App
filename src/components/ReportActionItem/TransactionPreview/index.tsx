import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionViolations from '@hooks/useTransactionViolations';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getIOUActionForReportID, getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {getOriginalTransactionWithSplitInfo, isCardTransaction, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import TransactionPreviewContent from './TransactionPreviewContent';
import type {TransactionPreviewProps} from './types';

function TransactionPreview(props: TransactionPreviewProps) {
    const {translate} = useLocalize();
    const {
        action,
        chatReportID,
        reportID,
        contextMenuAnchor,
        checkIfContextMenuActive = () => {},
        shouldDisplayContextMenu,
        iouReportID,
        transactionID: transactionIDFromProps,
        onPreviewPressed,
        reportPreviewAction,
        contextAction,
    } = props;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {canBeMissing: true});
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`, {canBeMissing: true});
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = transactionIDFromProps ?? (isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : null);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const violations = useTransactionViolations(transaction?.transactionID);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);
    const sessionAccountID = session?.accountID;
    const areThereDuplicates = allDuplicates.length > 0 && duplicates.length > 0 && allDuplicates.length === duplicates.length;

    const transactionDetails = useMemo(() => getTransactionDetails(transaction), [transaction]);
    const {amount: requestAmount, currency: requestCurrency} = transactionDetails ?? {};

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchor, contextAction ? chatReportID : reportID, contextAction ?? action, checkIfContextMenuActive);
    };

    const offlineWithFeedbackOnClose = useCallback(() => {
        clearWalletTermsError();
        clearIOUError(chatReportID);
    }, [chatReportID]);

    const navigateToReviewFields = useCallback(() => {
        Navigation.navigate(getReviewNavigationRoute(route, transactionThreadReport, transaction, duplicates));
    }, [duplicates, transactionThreadReport, route, transaction]);

    let transactionPreview = transaction;

    const {originalTransaction, isBillSplit} = getOriginalTransactionWithSplitInfo(transaction);

    if (isBillSplit) {
        transactionPreview = originalTransaction;
    }

    // See description of `transactionRawAmount` prop for more context
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionRawAmount = (transaction?.modifiedAmount || transaction?.amount) ?? 0;

    const iouAction = isBillSplit && originalTransaction ? (getIOUActionForReportID(chatReportID, originalTransaction.transactionID) ?? action) : action;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const isTransactionMadeWithCard = isCardTransaction(transaction);
    const showCashOrCardTranslation = isTransactionMadeWithCard ? 'iou.card' : 'iou.cash';
    const isReviewDuplicateTransactionPage = route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW;

    if (onPreviewPressed) {
        return (
            <PressableWithoutFeedback
                onPress={shouldDisableOnPress ? undefined : props.onPreviewPressed}
                onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={showContextMenu}
                shouldUseHapticsOnLongPress
                accessibilityLabel={isBillSplit ? translate('iou.split') : translate(showCashOrCardTranslation)}
                accessibilityHint={convertToDisplayString(requestAmount, requestCurrency)}
            >
                <TransactionPreviewContent
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...props}
                    action={iouAction}
                    isBillSplit={isBillSplit}
                    chatReport={chatReport}
                    personalDetails={personalDetails}
                    transaction={transactionPreview}
                    transactionRawAmount={transactionRawAmount}
                    report={report}
                    violations={violations}
                    offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
                    navigateToReviewFields={navigateToReviewFields}
                    areThereDuplicates={areThereDuplicates}
                    sessionAccountID={sessionAccountID}
                    walletTermsErrors={walletTerms?.errors}
                    routeName={route.name}
                    isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}
                />
            </PressableWithoutFeedback>
        );
    }

    return (
        <TransactionPreviewContent
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            action={iouAction}
            isBillSplit={isBillSplit}
            chatReport={chatReport}
            personalDetails={personalDetails}
            transaction={originalTransaction}
            transactionRawAmount={transactionRawAmount}
            report={report}
            violations={violations}
            offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
            navigateToReviewFields={navigateToReviewFields}
            areThereDuplicates={areThereDuplicates}
            sessionAccountID={sessionAccountID}
            walletTermsErrors={walletTerms?.errors}
            routeName={route.name}
            reportPreviewAction={reportPreviewAction}
            isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}
        />
    );
}

TransactionPreview.displayName = 'TransactionPreview';

export default TransactionPreview;
