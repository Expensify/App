import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionViolations from '@hooks/useTransactionViolations';

import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {getExpenseTypeTranslationKey, getOriginalTransactionWithSplitInfo, getTransactionType, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';

import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@navigation/types';

import {clearWalletTermsError} from '@userActions/PaymentMethods';
import {clearIOUError} from '@userActions/Report';

import CONST from '@src/CONST';
import useTransactionsByID from '@src/hooks/useTransactionsByID';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {GestureResponderEvent} from 'react-native';

import {useRoute} from '@react-navigation/native';
import React, {memo, useCallback, useMemo} from 'react';

import type {TransactionPreviewProps} from './types';

import TransactionPreviewContent from './TransactionPreviewContent';

function TransactionPreview(props: TransactionPreviewProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {action, chatReport, reportID, transactionID: transactionIDFromProps, onPreviewPressed, shouldHighlight, reportPreviewAction, contextAction} = props;
    const chatReportID = chatReport?.reportID;
    const {anchor: contextMenuAnchorRef, shouldDisplayContextMenu, originalReportID} = useShowContextMenuState();
    const {checkIfContextMenuActive} = useShowContextMenuActions();

    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW>>();
    // Preserve the launching context: on the review page this strips the suffix back to the base, otherwise it is the current active route.
    const reviewBasePath = useDynamicBackPath(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path);
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const transactionID = transactionIDFromProps ?? (isMoneyRequestAction ? getOriginalMessage(action)?.IOUTransactionID : undefined);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const violations = useTransactionViolations(transaction?.transactionID);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const session = useSession();
    const personalDetails = usePersonalDetails();

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicateIDs = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);
    const [allDuplicates] = useTransactionsByID(allDuplicateIDs);
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates ?? []), [allDuplicates]);
    const sessionAccountID = session?.accountID;
    const areThereDuplicates = allDuplicateIDs.length > 0 && duplicates.length > 0 && allDuplicateIDs.length === duplicates.length;

    const transactionDetails = getTransactionDetails(transaction);
    const {amount: requestAmount, currency: requestCurrency} = transactionDetails ?? {};

    const contextMenuReportID = contextAction ? chatReportID : reportID;
    const contextMenuAction = contextAction ?? action;

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchorRef, contextMenuReportID, contextMenuAction, checkIfContextMenuActive, originalReportID);
    };

    const offlineWithFeedbackOnClose = useCallback(() => {
        clearWalletTermsError();
        clearIOUError(chatReportID);
    }, [chatReportID]);

    const navigateToReviewFields = () =>
        Navigation.navigate(getReviewNavigationRoute(reviewBasePath, route.params?.reportID, transaction, duplicates, policy, policyCategories, policyTags ?? {}, report));

    const transactionPreview = transaction;

    const {isBillSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    // See description of `transactionRawAmount` prop for more context

    const transactionRawAmount = (Number(transaction?.modifiedAmount) || transaction?.amount) ?? 0;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const isReviewDuplicateTransactionPage = route.name === SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW;

    if (onPreviewPressed) {
        return (
            <PressableWithoutFeedback
                onPress={shouldDisableOnPress ? undefined : props.onPreviewPressed}
                onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={showContextMenu}
                shouldUseHapticsOnLongPress
                accessibilityLabel={isBillSplit ? translate('iou.split') : translate(getExpenseTypeTranslationKey(getTransactionType(transaction)))}
                accessibilityHint={convertToDisplayString(requestAmount, requestCurrency)}
                sentryLabel={CONST.SENTRY_LABEL.TRANSACTION_PREVIEW.CARD}
            >
                <TransactionPreviewContent
                    {...props}
                    action={action}
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
                    shouldHighlight={shouldHighlight}
                />
            </PressableWithoutFeedback>
        );
    }

    return (
        <TransactionPreviewContent
            {...props}
            action={action}
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
            shouldHighlight={shouldHighlight}
            isReviewDuplicateTransactionPage={isReviewDuplicateTransactionPage}
        />
    );
}

export default memo(TransactionPreview);
