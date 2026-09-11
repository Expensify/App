import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import useConfirmApproval from '@components/MoneyReportHeaderPrimaryAction/useConfirmApproval';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSearchApproveOnyxData} from '@libs/actions/Search';
import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils} from '@libs/ReportUtils';

import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ApproveActionCellProps = {
    isLoading: boolean;
    reportID: string;
    hash?: number;
    shouldDisablePointerEvents?: boolean;
    chatReport: OnyxEntry<Report>;
};

/**
 * Approve action for a Search row. Mirrors PayActionCell in owning the action end to end, so the row can render the
 * same ExpenseHeaderApprovalButton the report header uses and surface the partial/full approval choice up front when
 * the report has held expenses, rather than routing through the (pay-only) hold menu.
 */
function ApproveActionCell({isLoading, reportID, hash, shouldDisablePointerEvents, chatReport}: ApproveActionCellProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {currentSearchKey} = useSearchQueryContext();

    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const invoiceReceiverPolicyID = iouReport?.invoiceReceiver && 'policyID' in iouReport.invoiceReceiver ? iouReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);

    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);

    // Same derivation as ApprovePrimaryAction: the non-held amount only excludes non-reimbursables when a Pay button would show.
    const canIOUBePaid = canIOUBePaidAction(
        iouReport,
        chatReport,
        activePolicy,
        bankAccountList,
        currentUserDetails.login ?? '',
        currentUserDetails.accountID,
        // `undefined` (not the row's transactions) matches ApprovePrimaryAction, so Spend and the report header
        // derive shouldShowPayButton — and therefore the displayed approval amounts — identically.
        undefined,
        false,
        undefined,
        invoiceReceiverPolicy,
    );
    const onlyShowPayElsewhere =
        !canIOUBePaid &&
        canIOUBePaidAction(
            iouReport,
            chatReport,
            activePolicy,
            bankAccountList,
            currentUserDetails.login ?? '',
            currentUserDetails.accountID,
            undefined,
            true,
            undefined,
            invoiceReceiverPolicy,
        );

    // Search rows have no approval animation, but they do need the optimistic data that drops the row from the results.
    const {onApprove} = useConfirmApproval(reportID, () => {}, hash === undefined ? undefined : () => getSearchApproveOnyxData(hash, reportID, currentSearchKey));

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
                shouldShowPayButton={canIOUBePaid || onlyShowPayElsewhere}
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
