import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {ExpenseReportListItemProps, ExpenseReportListItemType, ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import {isOpenExpenseReport, isProcessingReport} from '@libs/ReportUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';
import ExpenseReportListItemRow from './ExpenseReportListItemRow';

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
    onCheckboxPress,
    onDEWModalOpen,
    isDEWBetaEnabled,
}: ExpenseReportListItemProps<TItem>) {
    const reportItem = item as unknown as ExpenseReportListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey, currentSearchResults} = useSearchContext();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

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
        const isEmpty = reportItem.transactions.length === 0;
        return isEmpty ?? reportItem.isDisabled ?? reportItem.isDisabledCheckbox;
    }, [reportItem.isDisabled, reportItem.isDisabledCheckbox, reportItem.transactions.length]);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleOnButtonPress = useCallback(() => {
        handleActionButtonPress({
            hash: currentSearchHash,
            item: reportItem,
            goToItem: () => onSelectRow(reportItem as unknown as TItem),
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
        reportItem,
        onSelectRow,
        snapshotReport,
        snapshotPolicy,
        lastPaymentMethod,
        personalPolicyID,
        currentSearchKey,
        onDEWModalOpen,
        isDEWBetaEnabled,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
    ]);

    const handleCheckboxPress = useCallback(() => {
        onCheckboxPress?.(reportItem as unknown as TItem);
    }, [onCheckboxPress, reportItem]);

    const listItemPressableStyle = useMemo(
        () => [
            styles.selectionListPressableItemWrapper,
            styles.pv3,
            styles.ph3,
            // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
            styles.bgTransparent,
            item.isSelected && styles.activeComponentBG,
            styles.mh0,
        ],
        [styles, item.isSelected],
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
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const shouldShowViolationDescription = isOpenExpenseReport(reportItem) || isProcessingReport(reportItem);

    const getDescription = useMemo(() => {
        if (!reportItem?.hasVisibleViolations || !shouldShowViolationDescription) {
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
                <Text style={[styles.textMicro, styles.textDanger]}>{translate('reportViolations.reportContainsExpensesWithViolations')}</Text>
            </View>
        );
    }, [
        reportItem?.hasVisibleViolations,
        shouldShowViolationDescription,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.mt2,
        styles.mr1,
        styles.textMicro,
        styles.textDanger,
        expensifyIcons.DotIndicator,
        theme.danger,
        translate,
    ]);

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            containerStyle={[styles.mb2]}
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
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            shouldShowRightCaret={false}
            shouldUseDefaultRightHandSideCheckmark={false}
        >
            {(hovered) => (
                <View style={[styles.flex1]}>
                    <ExpenseReportListItemRow
                        item={reportItem}
                        columns={columns}
                        policy={snapshotPolicy}
                        reportActions={reportActions}
                        isActionLoading={isActionLoading ?? isLoading}
                        showTooltip={showTooltip}
                        canSelectMultiple={canSelectMultiple}
                        onCheckboxPress={handleCheckboxPress}
                        onButtonPress={handleOnButtonPress}
                        isSelectAllChecked={!!reportItem.isSelected}
                        isIndeterminate={false}
                        isDisabledCheckbox={isDisabledCheckbox}
                        isHovered={hovered}
                        isFocused={isFocused}
                    />
                    {getDescription}
                </View>
            )}
        </BaseListItem>
    );
}

export default ExpenseReportListItem;
