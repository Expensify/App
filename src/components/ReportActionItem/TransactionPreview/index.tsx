import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionViolations from '@hooks/useTransactionViolations';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {getOriginalTransactionWithSplitInfo, isManagedCardTransaction, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import CONST from '@src/CONST';
import useTransactionsByID from '@src/hooks/useTransactionsByID';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import TransactionPreviewContent from './TransactionPreviewContent';
import type {TransactionPreviewProps} from './types';

function TransactionPreview(props: TransactionPreviewProps) {
    const {translate} = useLocalize();
    const {
        allReports,
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

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = transactionIDFromProps ?? (isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : undefined);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`, {canBeMissing: true});
    const violations = useTransactionViolations(transaction?.transactionID);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const session = useSession();
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    const personalDetails = usePersonalDetails();

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicateIDs = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const [allDuplicates] = useTransactionsByID(allDuplicateIDs);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates ?? []), [allDuplicates]);
    const sessionAccountID = session?.accountID;
    const areThereDuplicates = allDuplicateIDs.length > 0 && duplicates.length > 0 && allDuplicateIDs.length === duplicates.length;

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
        Navigation.navigate(getReviewNavigationRoute(Navigation.getActiveRoute(), route.params?.threadReportID, transaction, duplicates, policyCategories));
    }, [route.params?.threadReportID, transaction, duplicates, policyCategories]);

    const transactionPreview = transaction;

    const {isBillSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    const iouAction = action;

    // See description of `transactionRawAmount` prop for more context
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionRawAmount = (transaction?.modifiedAmount || transaction?.amount) ?? 0;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
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
                    isBillSplit={isBillSplit && !transaction?.comment?.originalTransactionID}
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
            transaction={originalTransaction ?? transaction}
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
