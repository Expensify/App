import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {markRejectViolationAsResolved} from '@libs/actions/IOU';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';

type MoneyRequestHeaderPrimaryActionProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;

    /** Whether this renders inline (narrow) or in a full-width container (wide) */
    isNarrow: boolean;

    /** Whether we're navigating from review duplicates flow */
    isFromReviewDuplicates: boolean;
};

function MoneyRequestHeaderPrimaryAction({reportID, isNarrow, isFromReviewDuplicates}: MoneyRequestHeaderPrimaryActionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    // Per-key Onyx subscriptions
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const parentReportActionID = report?.parentReportActionID;
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false});
    const parentReportAction = parentReportActionID ? parentReportActions?.[parentReportActionID] : undefined;
    const transactionIDFromAction = isMoneyRequestAction(parentReportAction)
        ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromAction}`, {});
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {duplicateTransactions} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);

    // Determine primary action
    const primaryAction = (() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, transactionViolations, policy, isFromReviewDuplicates);
    })();

    if (!primaryAction) {
        return null;
    }

    const primaryActionImplementation: Record<string, ReactNode> = {
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    changeMoneyRequestHoldStatus(parentReportAction, transaction);
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED]: (
            <Button
                success
                onPress={() => {
                    if (!transaction?.transactionID) {
                        return;
                    }
                    markRejectViolationAsResolved(transaction?.transactionID, reportID);
                }}
                text={translate('iou.reject.markAsResolved')}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
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
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE]: (
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
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                onPress={() => {
                    markAsCashAction(transaction?.transactionID, reportID, transactionViolations);
                }}
            />
        ),
    };

    const content = primaryActionImplementation[primaryAction];
    if (!content) {
        return null;
    }

    if (isNarrow) {
        return content;
    }

    return <View style={[styles.flexGrow4]}>{content}</View>;
}

MoneyRequestHeaderPrimaryAction.displayName = 'MoneyRequestHeaderPrimaryAction';

export default MoneyRequestHeaderPrimaryAction;
