// NOTE: The narrow-layout rendering of this component has a static twin in
// SearchStaticList (src/components/Search/SearchStaticList.tsx) used for fast
// perceived performance. If you change the narrow-layout UI here, verify the
// static version still looks visually identical.
import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {getButtonRole} from '@components/Button/utils';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import {useEditingCellState} from '@components/Table/EditableCell';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {handleActionButtonPress as handleActionButtonPressUtil} from '@libs/actions/Search';
import {syncMissingAttendeesViolation} from '@libs/AttendeeUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import {isDeletedTransaction as isDeletedTransactionUtil, isExpenseUnreported, isViolationDismissed, mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {TransactionViolation} from '@src/types/onyx/TransactionViolation';
import type {TransactionListItemProps, TransactionListItemType} from './types';
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
    nonPersonalAndWorkspaceCards,
    lastPaymentMethod,
    personalPolicyID,
    isLastItem,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
    policyForMovingExpenses,
    onUndelete,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const isDeletedTransaction = isDeletedTransactionUtil(transactionItem);
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey, currentSearchResults, currentSearchQueryJSON} = useSearchStateContext();
    const snapshotReport = (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] ?? {}) as Report;

    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`, {selector: isActionLoadingSelector});

    // Use active policy (user's current workspace) as fallback for self DM tracking expenses
    // This matches MoneyRequestView's approach via usePolicyForMovingExpenses()
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionItem.reportID)}`);
    const [transactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionItem?.reportAction?.childReportID}`);
    const [transaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionItem.transactionID)}`);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionPolicyID = transactionItem.policyID || snapshotReport?.policyID;
    const policyID = isExpenseUnreported(transaction) ? activePolicyID : transactionPolicyID;
    const [parentPolicy] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const snapshotPolicy = (currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] ?? {}) as Policy;

    const actionsData = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`];
    const exportedReportActions = actionsData ? Object.values(actionsData) : [];

    // Fetch policy categories directly from Onyx since they are not included in the search snapshot
    const [policyCategories] = originalUseOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);

    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${transactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(transactionItem.reportID)}`, {selector: parentReportActionSelector}, [
        transactionItem,
    ]);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const transactionPreviewData: TransactionPreviewData = {
        hasParentReport: !!parentReport,
        hasTransaction: !!transaction,
        hasParentReportAction: !!parentReportAction,
        hasTransactionThreadReport: !!transactionThreadReport,
    };

    const pressableStyle = [
        styles.transactionListItemStyle,
        !isLargeScreenWidth && styles.pt3,
        item.isSelected && styles.activeComponentBG,
        isLargeScreenWidth
            ? {
                  ...styles.flexRow,
                  ...styles.justifyContentBetween,
                  ...styles.alignItemsCenter,
                  ...StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, item.isSelected),
              }
            : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: StyleUtils.getSearchTableHighlightBorderRadius(isLargeScreenWidth),
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        shouldApplyOtherStyles: !isLargeScreenWidth,
    });

    const amountColumnSize = transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const taxAmountColumnSize = transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const dateColumnSize = transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const submittedColumnSize = transactionItem.shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const approvedColumnSize = transactionItem.shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const postedColumnSize = transactionItem.shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const exportedColumnSize = transactionItem.shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;

    // Prefer live Onyx policy data over snapshot to ensure fresh policy settings
    // like isAttendeeTrackingEnabled is not missing
    // Use snapshotReport/snapshotPolicy as fallbacks to fix offline issues where
    // newly created reports aren't in the search snapshot yet
    const policyForViolations = parentPolicy ?? snapshotPolicy;
    const reportForViolations = parentReport ?? snapshotReport;

    const onyxViolations = (violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionItem.transactionID}`] ?? []).filter(
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

    const transactionID = transactionItem.transactionID;

    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    // When a popover is opened during inline editing, onHoverOut never fires after editing ends, leaving the hover style stuck.
    // Disable it until the next intentional hover (onHoverIn).
    // See: https://github.com/Expensify/App/pull/83127#issuecomment-4114490080
    useEffect(() => {
        if (!wasRecentlyEditingCell) {
            return;
        }
        queueMicrotask(() => setShouldDisableHoverStyle(true));
    }, [wasRecentlyEditingCell]);

    const {
        canEditDate,
        canEditMerchant,
        canEditDescription,
        canEditCategory,
        canEditAmount,
        canEditTag,
        onEditDate,
        onEditMerchant,
        onEditDescription,
        onEditCategory,
        onEditAmount,
        onEditTag,
        wasEditingOnMouseDownRef,
    } = useTransactionInlineEdit({
        transactionID,
        reportID: transactionItem.reportID,
        reportActionID: transactionItem.reportAction?.reportActionID,
        parentReportAction,
        hash: currentSearchHash,
        queryJSON: currentSearchQueryJSON,
        fallbackReport: snapshotReport,
    });

    const handleOnPress = () => {
        // Consume the tap that dismissed an editing cell — a second tap will open the row.
        // We check the ref rather than isEditingCell because blur fires before onPress and resets the state.
        if (wasEditingOnMouseDownRef.current) {
            wasEditingOnMouseDownRef.current = false;
            return;
        }
        // react-native-web fires onPress on Space for role="button" elements; suppress it while a cell is being edited.
        if (isEditingCell) {
            return;
        }
        if (isDeletedTransaction && !canSelectMultiple) {
            return;
        }
        onSelectRow(item, transactionPreviewData);
    };

    const handleOnMouseDown = (e?: React.MouseEvent) => {
        wasEditingOnMouseDownRef.current = isEditingCell;

        // Skip preventDefault when editing so the browser naturally blurs the input (triggering save/cancel).
        if (!isEditingCell) {
            e?.preventDefault();
        }
    };

    const handleActionButtonPress = () => {
        handleActionButtonPressUtil({
            hash: currentSearchHash,
            item: transactionItem,
            goToItem: () => onSelectRow(item, transactionPreviewData),
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            userBillingGracePeriodEnds,
            currentSearchKey,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
            ownerBillingGracePeriodEnd,
            amountOwed,
            onUndelete: () => onUndelete?.(transactionItem),
        });
    };

    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={handleOnPress}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? getButtonRole(true) : 'none'}
                isNested
                onMouseDown={handleOnMouseDown}
                onHoverIn={() => setShouldDisableHoverStyle(false)}
                hoverStyle={[!item.isDisabled && !shouldDisableHoverStyle && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    isDeletedTransaction && styles.cursorDefault,
                ]}
                onFocus={onFocus}
                wrapperStyle={[
                    !isLargeScreenWidth && styles.mb2,
                    styles.mh5,
                    styles.flex1,
                    animatedHighlightStyle,
                    styles.userSelectNone,
                    isLargeScreenWidth && isLastItem && [styles.searchTableBottomRadius, styles.overflowHidden],
                ]}
            >
                {({hovered}) => (
                    <>
                        {!isLargeScreenWidth && (
                            <UserInfoAndActionButtonRow
                                item={transactionItem}
                                handleActionButtonPress={handleActionButtonPress}
                                shouldShowUserInfo={!isDeletedTransaction && !!transactionItem?.from}
                                isInMobileSelectionMode={shouldUseNarrowLayout && !!canSelectMultiple}
                                isDisabledItem={!!isDisabled}
                            />
                        )}
                        <TransactionItemRow
                            transactionItem={transactionItem}
                            report={transactionItem.report}
                            policy={transactionItem.policy}
                            shouldShowTooltip={showTooltip}
                            onButtonPress={handleActionButtonPress}
                            onCheckboxPress={() => onCheckboxPress?.(item)}
                            shouldUseNarrowLayout={!isLargeScreenWidth}
                            isLargeScreenWidth={isLargeScreenWidth}
                            columns={columns}
                            isActionLoading={isLoading ?? isActionLoading}
                            isSelected={!!transactionItem.isSelected}
                            isDisabled={!!isDisabled}
                            dateColumnSize={dateColumnSize}
                            submittedColumnSize={submittedColumnSize}
                            approvedColumnSize={approvedColumnSize}
                            postedColumnSize={postedColumnSize}
                            exportedColumnSize={exportedColumnSize}
                            amountColumnSize={amountColumnSize}
                            taxAmountColumnSize={taxAmountColumnSize}
                            isActionColumnWide={transactionItem.isActionColumnWide}
                            shouldShowCheckbox={!!canSelectMultiple}
                            checkboxSentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM_CHECKBOX}
                            style={[styles.p3, styles.pv2, shouldUseNarrowLayout ? styles.pt2 : isLargeScreenWidth && styles.noBorderRadius]}
                            violations={transactionViolations}
                            onArrowRightPress={isDeletedTransaction ? undefined : () => onSelectRow(item, transactionPreviewData)}
                            isHover={hovered}
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            reportActions={exportedReportActions}
                            policyForMovingExpenses={policyForMovingExpenses}
                            onEditDate={onEditDate}
                            onEditMerchant={onEditMerchant}
                            onEditDescription={onEditDescription}
                            onEditCategory={onEditCategory}
                            onEditAmount={onEditAmount}
                            onEditTag={onEditTag}
                            canEditDate={canEditDate}
                            canEditMerchant={canEditMerchant}
                            canEditDescription={canEditDescription}
                            canEditCategory={canEditCategory}
                            canEditAmount={canEditAmount}
                            canEditTag={canEditTag}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItem;
