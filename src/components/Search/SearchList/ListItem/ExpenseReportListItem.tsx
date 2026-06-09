import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
// We need direct access to useOnyx to fetch live policy data at render time
// without triggering the wrapper's additional logic, ensuring violations
// sync immediately when category settings change
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionContext} from '@components/Search/SearchContext';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {handleActionButtonPress} from '@libs/actions/Search';
import {syncMissingAttendeesViolation} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {getNonHeldAndFullAmount, isInvoiceReport, isOpenExpenseReport, isProcessingReport, isReportPendingDelete} from '@libs/ReportUtils';
import {isOnHold, isViolationDismissed, shouldShowViolation, showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';
import ExpenseReportListItemRow from './ExpenseReportListItemRow';
import type {ExpenseReportListItemProps, ExpenseReportListItemType} from './types';
import useLiveRowCapabilities from './useLiveRowCapabilities';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

/**
 * An expense report row in search results, showing status badge, total, and participants.
 */
function ExpenseReportListItem<TItem extends ListItem>({
    item,
    isLoading,
    isFocused,
    showTooltip,
    columns,
    canSelectMultiple,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    onSelectionButtonPress,
    lastPaymentMethod,
    personalPolicyID,
    isLastItem,
    isFirstItem,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
}: ExpenseReportListItemProps<TItem>) {
    const reportItem = item as unknown as ExpenseReportListItemType;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isSelected: liveRowSelected} = useRowSelection(item.keyForList);
    const {selectedTransactions} = useSearchSelectionContext();

    // For non-empty expense reports, `toggleTransaction` keys selection by child transaction ID, not the
    // report row key, so `useRowSelection(reportID)` alone never reflects selection. Derive the row state
    // from its transactions (all-or-nothing for expense reports), as the removed `applySelectionToItem` did.
    const transactionsWithoutPendingDelete = (reportItem.transactions ?? []).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const areAllReportTransactionsSelected =
        transactionsWithoutPendingDelete.length > 0 && transactionsWithoutPendingDelete.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected);
    const isSelected = liveRowSelected || areAllReportTransactionsSelected;
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportItem.reportID}`, {selector: isActionLoadingSelector});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const currentUserDetails = useCurrentUserPersonalDetails();

    // Fetch live policy categories from Onyx to sync violations at render time
    const [parentPolicy] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(reportItem.policyID)}`);
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportItem.reportID)}`);
    const [parentChatReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportItem.parentReportID)}`);
    const [policyCategories] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(reportItem.policyID)}`);

    const searchData = currentSearchResults?.data;

    const snapshotReport = useMemo(() => {
        return (searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as Report;
    }, [searchData, reportItem.reportID]);

    const snapshotChatReport = useMemo(() => {
        return searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.parentReportID}`];
    }, [searchData, reportItem.parentReportID]);

    const snapshotPolicy = useMemo(() => {
        return (searchData?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as Policy;
    }, [searchData, reportItem.policyID]);

    const reportActions = useMemo(() => {
        const actionsData = searchData?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportItem.reportID}`];
        return actionsData ? Object.values(actionsData) : [];
    }, [searchData, reportItem.reportID]);

    const liveReportItem = useLiveRowCapabilities<ExpenseReportListItemType>({
        item: reportItem,
        reportID: reportItem.reportID,
        itemKey: `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`,
        snapshotData: searchData,
        snapshotActions: reportActions,
        enabled: !!searchData,
    });

    const isDisabledCheckbox = useMemo(() => {
        return reportItem.isDisabled ?? reportItem.isDisabledCheckbox;
    }, [reportItem.isDisabled, reportItem.isDisabledCheckbox]);

    // Prefer live Onyx data over stale search snapshot for pending delete check.
    const reportForPendingDeleteCheck = parentReport ?? reportItem;
    const isPendingDelete = isReportPendingDelete(reportForPendingDeleteCheck);

    // Prefer live Onyx policy data over snapshot to ensure fresh policy settings
    // like isAttendeeTrackingEnabled is not missing
    // Use snapshotReport/snapshotPolicy as fallbacks to fix offline issues where
    // newly created reports aren't in the search snapshot yet
    const policyForViolations = parentPolicy ?? snapshotPolicy;
    const reportForViolations = parentReport ?? snapshotReport;

    // Sync missingAttendees violation at render time for each transaction in the report
    // This ensures violations show immediately when category settings change, without needing to click the row
    const hasSyncedMissingAttendeesViolation = useMemo(() => {
        if (!isAttendeeTrackingEnabled(policyForViolations)) {
            return false;
        }

        const isInvoice = isInvoiceReport(reportItem) || reportItem.type === CONST.REPORT.TYPE.INVOICE;
        return reportItem?.transactions?.some((transaction) => {
            const relevantViolations = (transaction.violations ?? []).filter(
                (violation) =>
                    !isViolationDismissed(transaction, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, reportForViolations, policyForViolations) &&
                    shouldShowViolation(reportForViolations, policyForViolations, violation.name, currentUserDetails.email ?? '', false, transaction),
            );

            const violations = syncMissingAttendeesViolation(
                relevantViolations,
                policyCategories,
                transaction.category ?? '',
                transaction.attendees,
                currentUserDetails,
                isAttendeeTrackingEnabled(policyForViolations),
                policyForViolations.type === CONST.POLICY.TYPE.CORPORATE,
                isInvoice,
            );
            return violations.some((violation) => violation.name === CONST.VIOLATIONS.MISSING_ATTENDEES);
        });
    }, [reportItem, policyCategories, policyForViolations, reportForViolations, currentUserDetails]);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {showConfirmModal} = useConfirmModal();
    const {showHoldMenu} = useHoldMenuModal();
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportItem.reportID);
    const liveReportTransactions = useMemo(() => Object.values(reportTransactions), [reportTransactions]);

    const handleOnButtonPress = useCallback(() => {
        handleActionButtonPress({
            hash: currentSearchHash,
            item: liveReportItem,
            goToItem: () => onSelectRow(reportItem as unknown as TItem),
            snapshotReport,
            snapshotPolicy,
            policy: parentPolicy,
            lastPaymentMethod,
            userBillingGracePeriodEnds,
            currentSearchKey,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
            onHoldMenuOpen: (holdItem, requestType, paymentType) => {
                // Search rows render from a snapshot; the report may not exist in the main
                // collection yet. Fall back to the snapshot so the modal can submit.
                const moneyRequestReport = parentReport ?? snapshotReport;
                const chatReport = parentChatReport ?? snapshotChatReport;
                const transactionsForHoldMenu = liveReportTransactions.length > 0 ? liveReportTransactions : holdItem.transactions;
                const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, holdItem.canPay ?? false, transactionsForHoldMenu);
                const hasNonHeldExpenses = transactionsForHoldMenu.some((t) => !isOnHold(t));
                showHoldMenu({
                    reportID: holdItem.reportID,
                    chatReportID: holdItem.parentReportID,
                    moneyRequestReport,
                    chatReport,
                    requestType,
                    paymentType,
                    nonHeldAmount: hasNonHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined,
                    fullAmount,
                    hasNonHeldExpenses,
                    transactionCount: transactionsForHoldMenu.length > 0 ? transactionsForHoldMenu.length : (holdItem.transactionCount ?? 0),
                });
            },
            ownerBillingGracePeriodEnd,
            amountOwed,
            onPendingCardTransactionsBlock: () => showPendingCardTransactionsBlockModal(showConfirmModal, translate),
        });
    }, [
        currentSearchHash,
        reportItem,
        liveReportItem,
        onSelectRow,
        snapshotReport,
        snapshotChatReport,
        snapshotPolicy,
        parentPolicy,
        parentReport,
        parentChatReport,
        lastPaymentMethod,
        userBillingGracePeriodEnds,
        personalPolicyID,
        currentSearchKey,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        showHoldMenu,
        liveReportTransactions,
        ownerBillingGracePeriodEnd,
        amountOwed,
        showConfirmModal,
        translate,
    ]);

    const handleSelectionButtonPress = useCallback(() => {
        onSelectionButtonPress?.(reportItem as unknown as TItem);
    }, [onSelectionButtonPress, reportItem]);

    const listItemPressableStyle = useMemo(
        () => [
            styles.selectionListPressableItemWrapper,
            isLargeScreenWidth && styles.pv3,
            isLargeScreenWidth ? styles.ph3 : styles.ph5,
            // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
            styles.bgTransparent,
            isSelected && styles.searchRowSelectedBG,
            styles.mh0,
            isPendingDelete && styles.cursorDisabled,
            isLargeScreenWidth ? StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, isSelected, {vertical: variables.tableRowPaddingVertical}) : styles.noBorderRadius,
            !isLargeScreenWidth && isFirstItem && [styles.tableTopRadius, styles.overflowHidden],
            !isLargeScreenWidth && isLastItem && [styles.tableBottomRadius, styles.overflowHidden],
        ],
        [styles, isSelected, isLargeScreenWidth, isFirstItem, isLastItem, isPendingDelete, StyleUtils],
    );

    const listItemWrapperStyle = useMemo(
        () => [
            styles.flex1,
            styles.userSelectNone,
            isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
        ],
        [styles, isLargeScreenWidth],
    );

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.searchRowSelectedBG : theme.appBG,
        shouldApplyOtherStyles: !isLargeScreenWidth,
    });

    const shouldShowViolationDescription = isOpenExpenseReport(reportItem) || isProcessingReport(reportItem);

    // Show violation description if either:
    // 1. Pre-computed hasVisibleViolations from search data, OR
    // 2. Synced missingAttendees violation computed at render time (for stale data)
    // We're using || instead of ?? because the variables are boolean
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasAnyVisibleViolations = reportItem?.hasVisibleViolations || hasSyncedMissingAttendeesViolation;

    const getDescription = useMemo(() => {
        if (reportItem?.isRejectedReport) {
            return (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <Icon
                        src={expensifyIcons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={[styles.mr1]}
                        width={12}
                        height={12}
                    />
                    <Text style={[isLargeScreenWidth ? styles.textMicro : styles.mutedNormalTextLabel, styles.textDanger]}>{translate('iou.rejectReport.rejectedReportMessage')}</Text>
                </View>
            );
        }
        if (!hasAnyVisibleViolations || !shouldShowViolationDescription) {
            return;
        }
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                <Icon
                    src={expensifyIcons.DotIndicator}
                    fill={theme.danger}
                    additionalStyles={[styles.mr1]}
                    width={12}
                    height={12}
                />
                <Text style={[isLargeScreenWidth ? styles.textMicro : styles.mutedNormalTextLabel, styles.textSupporting]}>
                    {translate('reportViolations.reportContainsExpensesWithViolations')}
                </Text>
            </View>
        );
    }, [
        reportItem?.isRejectedReport,
        hasAnyVisibleViolations,
        shouldShowViolationDescription,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.mt2,
        styles.mr1,
        styles.textMicro,
        styles.mutedNormalTextLabel,
        styles.textDanger,
        isLargeScreenWidth,
        expensifyIcons.DotIndicator,
        theme.danger,
        translate,
    ]);

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            isFocused={isFocused}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            onLongPressRow={onLongPressRow}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={isSelected && styles.searchRowSelectedBG}
            pressableWrapperStyle={[
                isLargeScreenWidth && styles.mh5,
                animatedHighlightStyle,
                isPendingDelete && styles.cursorDisabled,
                !isLargeScreenWidth && StyleUtils.getSelectedBorderBottomStyle(isSelected),
            ]}
            accessible={false}
            shouldShowRightCaret={false}
            isDisabled={isPendingDelete}
            shouldDisableHoverStyle={isPendingDelete}
        >
            {(hovered) => (
                <View style={[styles.flex1]}>
                    {!isLargeScreenWidth && (
                        <UserInfoAndActionButtonRow
                            item={liveReportItem}
                            shouldShowUserInfo={!!reportItem?.from}
                            stateNum={reportItem.stateNum}
                            statusNum={reportItem.statusNum}
                            isSelected={isSelected}
                        />
                    )}
                    <ExpenseReportListItemRow
                        item={liveReportItem}
                        columns={columns}
                        reportActions={reportActions}
                        isActionLoading={isActionLoading ?? isLoading}
                        showTooltip={showTooltip}
                        canSelectMultiple={canSelectMultiple}
                        onCheckboxPress={handleSelectionButtonPress}
                        onButtonPress={handleOnButtonPress}
                        isSelectAllChecked={isSelected}
                        isIndeterminate={false}
                        isDisabledCheckbox={isDisabledCheckbox}
                        isHovered={hovered}
                        isFocused={isFocused}
                        isPendingDelete={isPendingDelete}
                    />
                    {getDescription}
                </View>
            )}
        </BaseListItem>
    );
}

export default ExpenseReportListItem;
