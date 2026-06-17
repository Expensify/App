// NOTE: The narrow-layout rendering of this component has a static twin in
// SearchStaticList (src/components/Search/SearchStaticList.tsx) used for fast
// perceived performance. If you change the narrow-layout UI here, verify the
// static version still looks visually identical.
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {TransactionListItemProps, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useLiveRowCapabilities from '@components/Search/SearchList/ListItem/useLiveRowCapabilities';
import type {ListItem} from '@components/SelectionList/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useReportPaymentContext} from '@hooks/usePaymentContext';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {handleActionButtonPress as handleActionButtonPressUtil} from '@libs/actions/Search';
import {syncMissingAttendeesViolation} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import {
    isDeletedTransaction as isDeletedTransactionUtil,
    isViolationDismissed,
    mergeProhibitedViolations,
    shouldShowAttendees,
    shouldShowViolation,
    showPendingCardTransactionsBlockModal,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {TransactionViolation} from '@src/types/onyx/TransactionViolation';
import TransactionListItemNarrow from './TransactionListItemNarrow';
import TransactionListItemWide from './TransactionListItemWide';

function TransactionListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onSelectionButtonPress,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    columns,
    isLoading,
    nonPersonalAndWorkspaceCards,
    lastPaymentMethod,
    personalPolicyID,
    isLastItem,
    isFirstItem,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
    onUndelete,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const isDeletedTransaction = isDeletedTransactionUtil(transactionItem);

    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const snapshotData = currentSearchResults?.data;
    const snapshotReport = (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] ?? {}) as Report;

    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${transactionItem.reportID}`, {selector: isActionLoadingSelector});
    const [activePolicyIDFromOnyx] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    const {policyForMovingExpensesID, policyForMovingExpenses} = usePolicyForMovingExpenses();
    // Derived here (from this row's own live policy data) rather than drilled from the Search screen,
    // so the screen does not re-render every row when the moving policy changes.
    const isAttendeesEnabledForMovingPolicy = shouldShowAttendees(CONST.IOU.TYPE.SUBMIT, policyForMovingExpenses);

    // Use report's policyID as fallback when transaction doesn't have policyID directly
    // Use moving-expense policy as final fallback for SelfDM tracking expenses.
    // NOTE: Using || instead of ?? to treat empty string "" as falsy
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const explicitPolicyID = transactionItem.policyID || snapshotReport?.policyID;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    let policyID = explicitPolicyID || activePolicyIDFromOnyx;
    if (!policyID && transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        policyID = policyForMovingExpensesID;
    }
    const [parentPolicy] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const snapshotPolicy = (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] ?? {}) as Policy;

    const actionsData = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`];
    const exportedReportActions = actionsData ? Object.values(actionsData) : [];

    // Fetch policy categories directly from Onyx since they are not included in the search snapshot
    const [policyCategories] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);

    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionItem.reportID)}`);
    const [transactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionItem?.reportAction?.childReportID}`);
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(transactionItem?.report?.ownerAccountID)}, [
        transactionItem?.report?.ownerAccountID,
    ]);
    const [transaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionItem.transactionID)}`);
    const [transactionViolationsForRow] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionItem.transactionID)}`);
    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${transactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(transactionItem.reportID)}`, {selector: parentReportActionSelector}, [
        transactionItem,
    ]);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [parentChatReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(snapshotReport?.chatReportID)}`);
    const {amountOwed, currentUserAccountID, currentUserLogin, introSelected, betas, isSelfTourViewed, activePolicy, nextStep, chatReportPolicy} = useReportPaymentContext({
        reportID: transactionItem.reportID,
        chatReportPolicyID: parentChatReport?.policyID,
    });

    const liveTransactionItem = useLiveRowCapabilities<TransactionListItemType>({
        item: transactionItem,
        reportID: transactionItem.reportID,
        itemKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`,
        snapshotData,
        snapshotActions: exportedReportActions,
        enabled: !!snapshotData,
    });
    const transactionPreviewData: TransactionPreviewData = {
        hasParentReport: !!parentReport,
        hasTransaction: !!transaction,
        hasParentReportAction: !!parentReportAction,
        hasTransactionThreadReport: !!transactionThreadReport,
    };

    // Prefer live Onyx policy data over snapshot to ensure fresh policy settings
    // like isAttendeeTrackingEnabled is not missing
    // Use snapshotReport/snapshotPolicy as fallbacks to fix offline issues where
    // newly created reports aren't in the search snapshot yet
    const policyForViolations = parentPolicy ?? snapshotPolicy;
    const reportForViolations = parentReport ?? snapshotReport;

    const onyxViolations = (transactionViolationsForRow ?? []).filter(
        (violation: TransactionViolation) =>
            !isViolationDismissed(transactionItem, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, reportForViolations, policyForViolations) &&
            shouldShowViolation(reportForViolations, policyForViolations, violation.name, currentUserDetails.email ?? '', false, transactionItem),
    );

    const isInvoice = isInvoiceReport(reportForViolations) || reportForViolations.type === CONST.REPORT.TYPE.INVOICE;
    // Sync missingAttendees violation with current policy category settings (can be removed later when BE handles this)
    // Use live transaction data (attendees, category) to ensure we check against current state, not stale snapshot
    const attendeeOnyxViolations = syncMissingAttendeesViolation(
        onyxViolations,
        policyCategories,
        transaction?.category ?? transactionItem.category ?? '',
        transaction?.comment?.attendees ?? transactionItem.attendees,
        currentUserDetails,
        isAttendeeTrackingEnabled(policyForViolations),
        policyForViolations?.type === CONST.POLICY.TYPE.CORPORATE,
        isInvoice,
    );

    const transactionViolations = mergeProhibitedViolations(attendeeOnyxViolations);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const handleActionButtonPress = (event?: Parameters<typeof onSelectRow>[2]) => {
        handleActionButtonPressUtil({
            hash: currentSearchHash,
            item: liveTransactionItem,
            goToItem: () => onSelectRow(item, transactionPreviewData, event),
            snapshotReport,
            snapshotPolicy,
            submitterLogin,
            policy: parentPolicy,
            lastPaymentMethod,
            userBillingGracePeriodEnds,
            currentSearchKey,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
            ownerBillingGracePeriodEnd,
            amountOwed,
            onUndelete: () => onUndelete?.(transactionItem),
            onPendingCardTransactionsBlock: () => showPendingCardTransactionsBlockModal(showConfirmModal, translate),
            currentUserAccountID,
            currentUserLogin,
            introSelected,
            betas,
            isSelfTourViewed,
            activePolicy,
            chatReport: parentChatReport,
            chatReportPolicy,
            iouReportCurrentNextStepDeprecated: nextStep,
            searchData: currentSearchResults?.data,
        });
    };

    const sharedProps = {
        item: liveTransactionItem as unknown as TItem,
        isDeletedTransaction,
        isFocused,
        showTooltip,
        isDisabled,
        canSelectMultiple,
        onSelectRow,
        onCheckboxPress: onSelectionButtonPress,
        onFocus,
        onLongPressRow,
        shouldSyncFocus,
        columns,
        isLoading,
        isActionLoading,
        transactionViolations,
        handleActionButtonPress,
        transactionPreviewData,
        exportedReportActions,
        policyCategories,
        nonPersonalAndWorkspaceCards,
        isAttendeesEnabledForMovingPolicy,
    };

    if (!isLargeScreenWidth) {
        return (
            <TransactionListItemNarrow
                {...sharedProps}
                isLastItem={isLastItem}
                isFirstItem={isFirstItem}
            />
        );
    }

    return (
        <TransactionListItemWide
            {...sharedProps}
            isLastItem={isLastItem}
            currentSearchHash={currentSearchHash}
        />
    );
}

export default TransactionListItem;
