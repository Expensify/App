import React, {useContext, useRef} from 'react';
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
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
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
    const {currentSearchHash, currentSearchKey} = useSearchContext();
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});
    const snapshotReport = (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] ?? {}) as Report;

    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});

    const snapshotPolicy = (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] ?? {}) as Policy;
    const [lastPaymentMethod] = useOnyx(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionItem.reportID)}`, {canBeMissing: true});
    const [transactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionItem?.reportAction?.childReportID}`, {canBeMissing: true});
    const [transaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionItem.transactionID)}`, {canBeMissing: true});
    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${transactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(transactionItem.reportID)}`,
        {selector: parentReportActionSelector, canBeMissing: true},
        [transactionItem],
    );
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
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const amountColumnSize = transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const taxAmountColumnSize = transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const dateColumnSize = transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const submittedColumnSize = transactionItem.shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const approvedColumnSize = transactionItem.shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const postedColumnSize = transactionItem.shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const exportedColumnSize = transactionItem.shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;

    const transactionViolations = (violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionItem.transactionID}`] ?? []).filter(
        (violation: TransactionViolation) =>
            !isViolationDismissed(transactionItem, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, snapshotReport, snapshotPolicy) &&
            shouldShowViolation(snapshotReport, snapshotPolicy, violation.name, currentUserDetails.email ?? '', false, transactionItem),
    );

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleActionButtonPress = () => {
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
    };

    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={() => onSelectRow(item, transactionPreviewData)}
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
                            hash={currentSearchHash}
                            transactionItem={transactionItem}
                            report={transactionItem.report}
                            shouldShowTooltip={showTooltip}
                            onButtonPress={handleActionButtonPress}
                            onCheckboxPress={() => onCheckboxPress?.(item)}
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
                            onArrowRightPress={() => onSelectRow(item, transactionPreviewData)}
                            isHover={hovered}
                            customCardNames={customCardNames}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItem;
