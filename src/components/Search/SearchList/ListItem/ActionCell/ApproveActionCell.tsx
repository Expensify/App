import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExpenseHeaderApprovalButton from '@components/ExpenseHeaderApprovalButton';
import useConfirmApproval from '@components/MoneyReportHeaderPrimaryAction/useConfirmApproval';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSearchApproveOnyxData} from '@libs/actions/Search';

import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ApproveActionCellProps = {
    isLoading: boolean;
    reportID: string;
    policyID: string;
    hash?: number;
    shouldDisablePointerEvents?: boolean;
    chatReport: OnyxEntry<Report>;
    snapshotTransactions?: Transaction[];
};

function ApproveActionCell({isLoading, reportID, policyID, hash, shouldDisablePointerEvents, chatReport, snapshotTransactions}: ApproveActionCellProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();

    const [liveReport, liveTransactions] = useReportWithTransactionsAndViolations(reportID);
    const snapshotReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] as OnyxEntry<Report>;
    const snapshotPolicy = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] as OnyxEntry<Policy>;
    const iouReport = liveReport ?? snapshotReport;
    const transactions = liveTransactions.length > 0 || !snapshotTransactions ? liveTransactions : snapshotTransactions;

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const invoiceReceiverPolicyID = iouReport?.invoiceReceiver && 'policyID' in iouReport.invoiceReceiver ? iouReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);

    const canIOUBePaid = canIOUBePaidAction(
        iouReport,
        chatReport,
        activePolicy,
        bankAccountList,
        currentUserDetails.login ?? '',
        currentUserDetails.accountID,
        // Matches ApprovePrimaryAction so Spend and the report header show the same approval amounts.
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

    const {onApprove, isAnyTransactionOnHold} = useConfirmApproval(reportID, () => {}, {
        getAdditionalOnyxData: hash === undefined ? undefined : () => getSearchApproveOnyxData(hash, reportID, currentSearchKey),
        fallbackReport: snapshotReport,
        fallbackPolicy: snapshotPolicy,
        fallbackTransactions: snapshotTransactions,
    });

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
