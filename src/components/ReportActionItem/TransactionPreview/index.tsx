import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useTransactionPreviewData from '@hooks/useSingleExecution/useTransactionPreviewData';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {navigateToReviewFields} from '@libs/TransactionPreviewUtils';
import {removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';
import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import TransactionPreviewContent from './TransactionPreviewContent';
import type {TransactionPreviewProps} from './types';

function TransactionPreview(props: TransactionPreviewProps) {
    const {action, chatReportID, reportID, contextMenuAnchor, checkIfContextMenuActive = () => {}, shouldDisplayContextMenu} = props;

    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`);
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : null;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const violations = useTransactionViolations(transaction?.transactionID);

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);
    const areThereDuplicates = !!(allDuplicates.length && duplicates.length && allDuplicates.length === duplicates.length);

    const transactionPreviewData = useTransactionPreviewData(props, translate, route, areThereDuplicates);

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

    const navigate = useCallback(() => {
        navigateToReviewFields(route, report, transaction, duplicates);
    }, [duplicates, report, route, transaction]);

    return (
        <TransactionPreviewContent
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...transactionPreviewData}
            pendingAction={action.pendingAction}
            navigateToReviewFields={navigate}
            showContextMenu={showContextMenu}
            offlineWithFeedbackOnClose={offlineWithFeedbackOnClose}
            translate={translate}
        />
    );
}

TransactionPreview.displayName = 'TransactionPreview';

export default TransactionPreview;
