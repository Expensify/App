import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
// We need direct access to useOnyx to fetch live policy data at render time
// without triggering the wrapper's additional logic, ensuring violations
// sync immediately when category settings change
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import {useSearchStateContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import {syncMissingAttendeesViolation} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {isInvoiceReport, isOpenExpenseReport, isProcessingReport, isReportPendingDelete} from '@libs/ReportUtils';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';
import ExpenseReportListItemRow from './ExpenseReportListItemRow';
import type {ExpenseReportListItemProps, ExpenseReportListItemType} from './types';
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
    onHoldMenuOpen,
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
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportItem.reportID}`, {selector: isActionLoadingSelector});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const currentUserDetails = useCurrentUserPersonalDetails();

    // Fetch live policy categories from Onyx to sync violations at render time
    const [parentPolicy] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(reportItem.policyID)}`);
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportItem.reportID)}`);
    const [policyCategories] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(reportItem.policyID)}`);

    const searchData = currentSearchResults?.data;

    const snapshotReport = useMemo(() => {
        return (searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as Report;
    }, [searchData, reportItem.reportID]);

    const snapshotPolicy = useMemo(() => {
        return (searchData?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as Policy;
    }, [searchData, reportItem.policyID]);

    const reportActions = useMemo(() => {
        const actionsData = searchData?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportItem.reportID}`];
        return actionsData ? Object.values(actionsData) : [];
    }, [searchData, reportItem.reportID]);

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

    const handleOnButtonPress = useCallback(() => {
        handleActionButtonPress({
            hash: currentSearchHash,
            item: reportItem,
            goToItem: () => onSelectRow(reportItem as unknown as TItem),
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            userBillingGracePeriodEnds,
            currentSearchKey,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
            onHoldMenuOpen,
            ownerBillingGracePeriodEnd,
            amountOwed,
        });
    }, [
        currentSearchHash,
        reportItem,
        onSelectRow,
        snapshotReport,
        snapshotPolicy,
        lastPaymentMethod,
        userBillingGracePeriodEnds,
        personalPolicyID,
        currentSearchKey,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        onHoldMenuOpen,
        ownerBillingGracePeriodEnd,
        amountOwed,
    ]);

    const handleSelectionButtonPress = useCallback(() => {
        onSelectionButtonPress?.(reportItem as unknown as TItem);
    }, [onSelectionButtonPress, reportItem]);

    const listItemPressableStyle = useMemo(
        () => [
            styles.selectionListPressableItemWrapper,
            isLargeScreenWidth && styles.pv3,
            isLargeScreenWidth && styles.ph3,
            // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
            styles.bgTransparent,
            item.isSelected && styles.activeComponentBG,
            styles.mh0,
            isPendingDelete && styles.cursorDisabled,
            isLargeScreenWidth ? StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, item.isSelected, {vertical: variables.tableRowPaddingVertical}) : styles.noBorderRadius,
            !isLargeScreenWidth && isFirstItem && [styles.searchTableTopRadius, styles.overflowHidden],
            !isLargeScreenWidth && isLastItem && [styles.searchTableBottomRadius, styles.overflowHidden],
        ],
        [styles, item.isSelected, isLargeScreenWidth, isFirstItem, isLastItem, isPendingDelete, StyleUtils],
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
        backgroundColor: item.isSelected ? theme.activeComponentBG : theme.highlightBG,
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
                <Text style={[isLargeScreenWidth ? styles.textMicro : styles.mutedNormalTextLabel, styles.textDanger]}>
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
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[
                styles.mh5,
                animatedHighlightStyle,
                isPendingDelete && styles.cursorDisabled,
                isLargeScreenWidth && isLastItem && [styles.searchTableBottomRadius, styles.overflowHidden],
                !isLargeScreenWidth && isFirstItem && styles.searchTableTopRadius,
                !isLargeScreenWidth && isLastItem && styles.searchTableBottomRadius,
                !isLargeScreenWidth && !isLastItem && StyleUtils.getSelectedBorderBottomStyle(item.isSelected),
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
                            item={reportItem}
                            shouldShowUserInfo={!!reportItem?.from}
                            stateNum={reportItem.stateNum}
                            statusNum={reportItem.statusNum}
                            isSelected={!!reportItem.isSelected}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={styles.pt3}>
                            <ExpenseReportListItemRow
                                item={reportItem}
                                columns={columns}
                                reportActions={reportActions}
                                isActionLoading={isActionLoading ?? isLoading}
                                showTooltip={showTooltip}
                                canSelectMultiple={canSelectMultiple}
                                onCheckboxPress={handleSelectionButtonPress}
                                onButtonPress={handleOnButtonPress}
                                isSelectAllChecked={!!reportItem.isSelected}
                                isIndeterminate={false}
                                isDisabledCheckbox={isDisabledCheckbox}
                                isHovered={hovered}
                                isFocused={isFocused}
                                isPendingDelete={isPendingDelete}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                    )}
                    {isLargeScreenWidth && (
                        <ExpenseReportListItemRow
                            item={reportItem}
                            columns={columns}
                            reportActions={reportActions}
                            isActionLoading={isActionLoading ?? isLoading}
                            showTooltip={showTooltip}
                            canSelectMultiple={canSelectMultiple}
                            onCheckboxPress={handleSelectionButtonPress}
                            onButtonPress={handleOnButtonPress}
                            isSelectAllChecked={!!reportItem.isSelected}
                            isIndeterminate={false}
                            isDisabledCheckbox={isDisabledCheckbox}
                            isHovered={hovered}
                            isFocused={isFocused}
                            isPendingDelete={isPendingDelete}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    )}
                    {getDescription}
                </View>
            )}
        </BaseListItem>
    );
}

export default ExpenseReportListItem;
