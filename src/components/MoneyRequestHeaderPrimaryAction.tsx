import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {markRejectViolationAsResolved} from '@libs/actions/IOU/RejectMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import Button from './Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {useWideRHPState} from './WideRHPContextProvider';

type MoneyRequestHeaderPrimaryActionProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;
};

function MoneyRequestHeaderPrimaryAction({reportID}: MoneyRequestHeaderPrimaryActionProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useWideRHPState();
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
    >();

    const isNarrow = !shouldUseNarrowLayout || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);
    const {isOffline} = useNetwork();
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');

    // Per-key Onyx subscriptions
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`);
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const transactionIDFromAction = isMoneyRequestAction(parentReportAction)
        ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromAction}`);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {duplicateTransactions} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);

    const primaryAction =
        report && parentReport && transaction
            ? getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, transactionViolations, policy, isFromReviewDuplicates)
            : '';

    const renderButton = () => {
        if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD) {
            return (
                <Button
                    success
                    text={translate('iou.unhold')}
                    onPress={() => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }
                        changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline, formatPhoneNumber);
                    }}
                />
            );
        }

        if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED) {
            return (
                <Button
                    success
                    text={translate('iou.reject.markAsResolved')}
                    onPress={() => {
                        if (!transaction?.transactionID) {
                            return;
                        }
                        markRejectViolationAsResolved(transaction.transactionID, isOffline, reportID);
                    }}
                />
            );
        }

        if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES) {
            return (
                <Button
                    success
                    text={translate('iou.reviewDuplicates')}
                    onPress={() => {
                        if (!reportID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                    }}
                />
            );
        }

        if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE) {
            return (
                <Button
                    success
                    text={translate('violations.keepThisOne')}
                    onPress={() => {
                        if (!reportID) {
                            return;
                        }
                        Navigation.navigate(
                            getReviewNavigationRoute(
                                Navigation.getActiveRoute(),
                                reportID,
                                transaction,
                                removeSettledAndApprovedTransactions(
                                    Object.values(duplicateTransactions ?? {}).filter((t): t is NonNullable<typeof t> => !!t && t.transactionID !== transaction?.transactionID),
                                ),
                                policy,
                                policyCategories,
                                policyTags ?? {},
                                transactionReport,
                            ),
                        );
                    }}
                />
            );
        }

        if (primaryAction === CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH) {
            return (
                <Button
                    success
                    text={translate('iou.markAsCash')}
                    onPress={() => {
                        markAsCashAction(transaction?.transactionID, reportID, transactionViolations);
                    }}
                />
            );
        }

        return null;
    };

    const button = renderButton();

    if (!button) {
        return null;
    }

    if (isNarrow) {
        return button;
    }

    return <View style={[styles.flexGrow4]}>{button}</View>;
}

MoneyRequestHeaderPrimaryAction.displayName = 'MoneyRequestHeaderPrimaryAction';

export default MoneyRequestHeaderPrimaryAction;
