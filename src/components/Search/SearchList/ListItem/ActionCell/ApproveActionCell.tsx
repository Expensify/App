import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {useReportPaymentContext} from '@hooks/usePaymentContext';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';

import {approveMoneyRequest, canIOUBePaid} from '@libs/actions/IOU/ReportWorkflow';
import {getSearchApproveOnyxData} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

type ApproveActionCellProps = {
    isLoading: boolean;
    policyID: string;
    reportID: string;
    hash?: number;
    shouldDisablePointerEvents?: boolean;
    chatReport: OnyxEntry<Report>;
};

/**
 * Approve action for a Search row. Mirrors PayActionCell: the cell owns the action end to end so the row can render the
 * shared ExpenseHeaderApprovalButton, which surfaces the partial/full approval choice up front when the report has held
 * expenses instead of routing through the (pay-only) hold menu.
 */
function ApproveActionCell({isLoading, policyID, reportID, hash, shouldDisablePointerEvents, chatReport}: ApproveActionCellProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {currentSearchKey} = useSearchQueryContext();

    const [iouReport, transactions, violations] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsLoginSelector(iouReport?.ownerAccountID),
    });
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const {currentUserLogin, currentUserAccountID, email, betas, userBillingGracePeriodEnds, amountOwed, ownerBillingGracePeriodEnd, delegateEmail, delegateAccountID} =
        useReportPaymentContext({
            chatReportPolicyID: chatReport?.policyID,
        });

    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);
    const hasViolations = hasViolationsReportUtils(reportID, violations, currentUserAccountID, email ?? '', undefined, transactions);

    // Matches the report header/preview: the non-held amount excludes non-reimbursables only when a Pay button would show.
    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, false, undefined, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere =
        !canBePaid && canIOUBePaid(iouReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, true, undefined, invoiceReceiverPolicy);

    const onApprove = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        if (policyID && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
            return;
        }
        approveMoneyRequest({
            expenseReport: iouReport,
            expenseReportPolicy: policy,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            ownerLogin,
            full,
            delegateEmail,
            delegateAccountID,
            isTrackIntentUser,
            additionalOnyxData: hash !== undefined ? getSearchApproveOnyxData(hash, reportID, currentSearchKey) : undefined,
        });
    };

    return (
        <SearchScopeProvider isOnSearch={false}>
            <ExpenseHeaderApprovalButton
                isAnyTransactionOnHold={isAnyTransactionOnHold}
                isDelegateAccessRestricted={isDelegateAccessRestricted}
                onApprove={onApprove}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                moneyRequestReport={iouReport}
                transactions={transactions}
                shouldShowPayButton={canBePaid || shouldOnlyShowElsewhere}
                isLoading={isLoading}
                size={CONST.BUTTON_SIZE.SMALL}
                shouldUseShortForm
                isNested
                isDisabled={isOffline || shouldDisablePointerEvents}
                stayNormalOnDisable={shouldDisablePointerEvents}
                style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                wrapperStyle={styles.w100}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_ACTION}
            />
        </SearchScopeProvider>
    );
}

export default ApproveActionCell;
