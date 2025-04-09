import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {getTransaction, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import TransactionPreviewContent from './TransactionPreviewContent';
import type {TransactionPreviewProps} from './types';

const getOriginalTransactionIfBillIsSplit = (transaction: OnyxEntry<Transaction>) => {
    const {originalTransactionID, source} = transaction?.comment ?? {};

    if (!originalTransactionID || source !== CONST.IOU.TYPE.SPLIT) {
        return {isSplit: false, originalTransaction: transaction};
    }

    const originalTransaction = getTransaction(originalTransactionID);

    return {isSplit: !!originalTransaction, originalTransaction: originalTransaction ?? transaction};
};

function TransactionPreview(props: TransactionPreviewProps) {
    const {action, chatReportID, reportID, contextMenuAnchor, checkIfContextMenuActive = () => {}, shouldDisplayContextMenu, iouReportID, transactionID: transactionIDFromProps} = props;

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`);
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = transactionIDFromProps ?? (isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : null);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const violations = useTransactionViolations(transaction?.transactionID);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);
    const sessionAccountID = session?.accountID;
    const areThereDuplicates = allDuplicates.length > 0 && duplicates.length > 0 && allDuplicates.length === duplicates.length;

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchor, reportID, action, checkIfContextMenuActive);
    };

    const offlineWithFeedbackOnClose = useCallback(() => {
        clearWalletTermsError();
        clearIOUError(chatReportID);
    }, [chatReportID]);

    const navigateToReviewFields = useCallback(() => {
        Navigation.navigate(getReviewNavigationRoute(route, report, transaction, duplicates));
    }, [duplicates, report, route, transaction]);

    const {originalTransaction, isSplit} = getOriginalTransactionIfBillIsSplit(transaction);

    return (
        <TransactionPreviewContent
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            isBillSplit={isSplit}
            chatReport={chatReport}
            personalDetails={personalDetails}
            transaction={originalTransaction}
            iouReport={iouReport}
            violations={violations}
            showContextMenu={showContextMenu}
            offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
            navigateToReviewFields={navigateToReviewFields}
            areThereDuplicates={areThereDuplicates}
            sessionAccountID={sessionAccountID}
            walletTermsErrors={walletTerms?.errors}
            routeName={route.name}
        />
    );
}

TransactionPreview.displayName = 'TransactionPreview';

export default TransactionPreview;
