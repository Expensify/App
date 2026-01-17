import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {getButtonRole} from '@components/Button/utils';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, TransactionListItemProps, TransactionListItemType} from '@components/SelectionListWithSections/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {handleActionButtonPress as handleActionButtonPressUtil} from '@libs/actions/Search';
import {syncMissingAttendeesViolation} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isViolationDismissed, mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {TransactionViolation} from '@src/types/onyx/TransactionViolation';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

function TransactionListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    columns,
    isLoading,
    violations,
    customCardNames,
    onDEWModalOpen,
    isDEWBetaEnabled,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey, currentSearchResults} = useSearchContext();
    const snapshotReport = useMemo(() => {
        return (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] ?? {}) as Report;
    }, [currentSearchResults, transactionItem.reportID]);

    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});

    // Use active policy (user's current workspace) as fallback for self DM tracking expenses
    // This matches MoneyRequestView's approach via usePolicyForMovingExpenses()
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    // Use report's policyID as fallback when transaction doesn't have policyID directly
    // Use active policy as final fallback for SelfDM (tracking expenses)
    // NOTE: Using || instead of ?? to treat empty string "" as falsy
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const policyID = transactionItem.policyID || snapshotReport?.policyID || activePolicyID;
    const [parentPolicy] = originalUseOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: (policy) => policy?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
    });
    const snapshotPolicy = useMemo(() => {
        return (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] ?? {}) as Policy;
    }, [currentSearchResults, transactionItem.policyID]);

    const exportedReportActions = useMemo(() => {
        const actionsData = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`];
        return actionsData ? Object.values(actionsData) : [];
    }, [currentSearchResults, transactionItem.reportID]);

    // Fetch policy categories directly from Onyx since they are not included in the search snapshot
    const [policyCategories] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {canBeMissing: true});
    const [lastPaymentMethod] = useOnyx(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionItem.reportID)}`, {canBeMissing: true});
    const [transactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionItem?.reportAction?.childReportID}`, {canBeMissing: true});
    const [transaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionItem.transactionID)}`, {canBeMissing: true});
    const parentReportActionSelector = useCallback(
        (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${transactionItem?.reportAction?.reportActionID}`],
        [transactionItem?.reportAction?.reportActionID],
    );
    const [parentReportAction] = originalUseOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(transactionItem.reportID)}`,
        {selector: parentReportActionSelector, canBeMissing: true},
        [transactionItem],
    );
    const currentUserDetails = useCurrentUserPersonalDetails();
    const transactionPreviewData: TransactionPreviewData = useMemo(
        () => ({hasParentReport: !!parentReport, hasTransaction: !!transaction, hasParentReportAction: !!parentReportAction, hasTransactionThreadReport: !!transactionThreadReport}),
        [parentReport, transaction, parentReportAction, transactionThreadReport],
    );

    const pressableStyle = [
        styles.transactionListItemStyle,
        !isLargeScreenWidth && styles.pt3,
        item.isSelected && styles.activeComponentBG,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize, submittedColumnSize, approvedColumnSize, postedColumnSize, exportedColumnSize} = useMemo(() => {
        return {
            amountColumnSize: transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            submittedColumnSize: transactionItem.shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            approvedColumnSize: transactionItem.shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            postedColumnSize: transactionItem.shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            exportedColumnSize: transactionItem.shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [
        transactionItem.isAmountColumnWide,
        transactionItem.isTaxAmountColumnWide,
        transactionItem.shouldShowYear,
        transactionItem.shouldShowYearSubmitted,
        transactionItem.shouldShowYearApproved,
        transactionItem.shouldShowYearPosted,
        transactionItem.shouldShowYearExported,
    ]);

    // Prefer live Onyx policy data over snapshot to ensure fresh policy settings
    // like isAttendeeTrackingEnabled is not missing
    // Use snapshotReport/snapshotPolicy as fallbacks to fix offline issues where
    // newly created reports aren't in the search snapshot yet
    const policyForViolations = parentPolicy ?? snapshotPolicy;
    const reportForViolations = parentReport ?? snapshotReport;

    const transactionViolations = useMemo(() => {
        const onyxViolations = (violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionItem.transactionID}`] ?? []).filter(
            (violation: TransactionViolation) =>
                !isViolationDismissed(transactionItem, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, reportForViolations, policyForViolations) &&
                shouldShowViolation(reportForViolations, policyForViolations, violation.name, currentUserDetails.email ?? '', false, transactionItem),
        );

        // Sync missingAttendees violation with current policy category settings (can be removed later when BE handles this)
        // Use live transaction data (attendees, category) to ensure we check against current state, not stale snapshot
        const attendeeOnyxViolations = syncMissingAttendeesViolation(
            onyxViolations,
            policyCategories,
            transaction?.category ?? transactionItem.category ?? '',
            transaction?.comment?.attendees ?? transactionItem.attendees,
            currentUserDetails,
            policyForViolations?.isAttendeeTrackingEnabled ?? false,
            policyForViolations?.type === CONST.POLICY.TYPE.CORPORATE,
        );

        return mergeProhibitedViolations(attendeeOnyxViolations);
    }, [policyForViolations, reportForViolations, policyCategories, transactionItem, currentUserDetails, violations]);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleActionButtonPress = useCallback(() => {
        handleActionButtonPressUtil({
            hash: currentSearchHash,
            item: transactionItem,
            goToItem: () => onSelectRow(item, transactionPreviewData),
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            currentSearchKey,
            onDEWModalOpen,
            isDEWBetaEnabled,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
        });
    }, [
        currentSearchHash,
        transactionItem,
        transactionPreviewData,
        snapshotReport,
        snapshotPolicy,
        lastPaymentMethod,
        personalPolicyID,
        currentSearchKey,
        onSelectRow,
        item,
        onDEWModalOpen,
        isDEWBetaEnabled,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
    ]);

    const handleCheckboxPress = useCallback(() => {
        onCheckboxPress?.(item);
    }, [item, onCheckboxPress]);

    const onPress = useCallback(() => {
        onSelectRow(item, transactionPreviewData);
    }, [item, onSelectRow, transactionPreviewData]);

    const onLongPress = useCallback(() => {
        onLongPressRow?.(item);
    }, [item, onLongPressRow]);

    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={onLongPress}
                onPress={onPress}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                onMouseDown={(e) => e.preventDefault()}
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, styles.flex1, animatedHighlightStyle, styles.userSelectNone]}
            >
                {({hovered}) => (
                    <>
                        {!isLargeScreenWidth && (
                            <UserInfoAndActionButtonRow
                                item={transactionItem}
                                handleActionButtonPress={handleActionButtonPress}
                                shouldShowUserInfo={!!transactionItem?.from}
                                isInMobileSelectionMode={shouldUseNarrowLayout && !!canSelectMultiple}
                            />
                        )}
                        <TransactionItemRow
                            transactionItem={transactionItem}
                            report={transactionItem.report}
                            shouldShowTooltip={showTooltip}
                            onButtonPress={handleActionButtonPress}
                            onCheckboxPress={handleCheckboxPress}
                            shouldUseNarrowLayout={!isLargeScreenWidth}
                            columns={columns}
                            isActionLoading={isLoading ?? isActionLoading}
                            isSelected={!!transactionItem.isSelected}
                            dateColumnSize={dateColumnSize}
                            submittedColumnSize={submittedColumnSize}
                            approvedColumnSize={approvedColumnSize}
                            postedColumnSize={postedColumnSize}
                            exportedColumnSize={exportedColumnSize}
                            amountColumnSize={amountColumnSize}
                            taxAmountColumnSize={taxAmountColumnSize}
                            shouldShowCheckbox={!!canSelectMultiple}
                            style={[styles.p3, styles.pv2, shouldUseNarrowLayout ? styles.pt2 : {}]}
                            violations={transactionViolations}
                            onArrowRightPress={onPress}
                            isHover={hovered}
                            customCardNames={customCardNames}
                            reportActions={exportedReportActions}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItem;
