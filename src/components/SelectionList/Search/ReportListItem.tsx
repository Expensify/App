import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ReportListItemHeader from './ReportListItemHeader';

function ReportListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onCheckboxPress,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}, canBeMissing: true});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem?.policyID}`];
    const isEmptyReport = reportItem.transactions.length === 0;
    const isDisabledOrEmpty = isEmptyReport || isDisabled;
    const {isLargeScreenWidth} = useResponsiveLayout();

    const dateColumnSize = useMemo(() => {
        const shouldShowYearForSomeTransaction = reportItem.transactions.some((transaction) => shouldShowTransactionYear(transaction));
        return shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    }, [reportItem.transactions]);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv1half,
        styles.ph0,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        const isFromSelfDM = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        const reportID =
            (!transactionItem.isFromOneTransactionReport || isFromSelfDM) && transactionItem.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                ? transactionItem.transactionThreadReportID
                : transactionItem.reportID;

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
    };

    if (!reportItem?.reportName && reportItem.transactions.length > 1) {
        return null;
    }

    if (isEmptyReport && !isBetaEnabled(CONST.BETAS.TABLE_REPORT_VIEW)) {
        return null;
    }

    const sampleTransaction = reportItem.transactions.at(0);
    const {COLUMNS} = CONST.REPORT.TRANSACTION_LIST;

    const columns = [
        COLUMNS.RECEIPT,
        COLUMNS.TYPE,
        COLUMNS.DATE,
        COLUMNS.MERCHANT,
        COLUMNS.FROM,
        COLUMNS.TO,
        ...(sampleTransaction?.shouldShowCategory ? [COLUMNS.CATEGORY] : []),
        ...(sampleTransaction?.shouldShowTag ? [COLUMNS.TAG] : []),
        ...(sampleTransaction?.shouldShowTax ? [COLUMNS.TAX] : []),
        COLUMNS.TOTAL_AMOUNT,
        COLUMNS.ACTION,
    ] as Array<ValueOf<typeof COLUMNS>>;

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb2]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onLongPressRow={onLongPressRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldShowBlueBorderOnFocus
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
        >
            {(hovered) => (
                <View style={[styles.flex1]}>
                    <ReportListItemHeader
                        report={reportItem}
                        policy={policy}
                        item={item}
                        onSelectRow={onSelectRow}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabledOrEmpty}
                        isHovered={hovered}
                        isFocused={isFocused}
                        canSelectMultiple={canSelectMultiple}
                    />
                    {isEmptyReport ? (
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                            <Text
                                style={[styles.textLabelSupporting]}
                                numberOfLines={1}
                            >
                                {translate('search.moneyRequestReport.emptyStateTitle')}
                            </Text>
                        </View>
                    ) : (
                        reportItem.transactions.map((transaction) => (
                            <View>
                                <TransactionItemRow
                                    transactionItem={transaction}
                                    isSelected={!!transaction.isSelected}
                                    dateColumnSize={dateColumnSize}
                                    shouldShowTooltip={showTooltip}
                                    shouldUseNarrowLayout={!isLargeScreenWidth}
                                    shouldShowCheckbox={!!canSelectMultiple}
                                    onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                                    columns={columns}
                                    onButtonPress={() => {
                                        openReportInRHP(transaction);
                                    }}
                                    isParentHovered={hovered}
                                    columnWrapperStyles={[styles.ph3, styles.pv1half]}
                                    isInReportRow
                                />
                            </View>
                        ))
                    )}
                </View>
            )}
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
