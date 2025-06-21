import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, TransactionGroupListItemProps, TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import variables from '@styles/variables';
import {setActiveTransactionThreadIDs} from '@userActions/TransactionThreadNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ReportListItemHeader from './ReportListItemHeader';

function TransactionGroupListItem<TItem extends ListItem>({
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
    groupBy,
}: TransactionGroupListItemProps<TItem>) {
    const groupItem = item as unknown as TransactionGroupListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}, canBeMissing: true});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${groupItem?.policyID}`];
    const isEmpty = groupItem.transactions.length === 0;
    const isDisabledOrEmpty = isEmpty || isDisabled;
    const {isLargeScreenWidth} = useResponsiveLayout();

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        const isAmountColumnWide = groupItem.transactions.some((transaction) => isTransactionAmountTooLong(transaction));
        const isTaxAmountColumnWide = groupItem.transactions.some((transaction) => isTransactionTaxAmountTooLong(transaction));
        const shouldShowYearForSomeTransaction = groupItem.transactions.some((transaction) => shouldShowTransactionYear(transaction));
        return {
            amountColumnSize: isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [groupItem.transactions]);

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

        const reportID = getReportIDForTransaction(transactionItem);
        const siblingTransactionThreadIDs = groupItem.transactions.map(getReportIDForTransaction);

        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        setActiveTransactionThreadIDs(siblingTransactionThreadIDs).then(() => {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        });
    };

    const sampleTransaction = groupItem.transactions.at(0);
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
    ] satisfies Array<ValueOf<typeof COLUMNS>>;

    const getHeader = useCallback(
        (isHovered: boolean) => {
            switch (groupBy) {
                case CONST.SEARCH.GROUP_BY.REPORTS:
                    return (
                        <ReportListItemHeader
                            report={groupItem as unknown as TransactionReportGroupListItemType}
                            policy={policy}
                            onSelectRow={onSelectRow}
                            onCheckboxPress={onCheckboxPress}
                            isDisabled={isDisabledOrEmpty}
                            isHovered={isHovered}
                            isFocused={isFocused}
                            canSelectMultiple={canSelectMultiple}
                        />
                    );
                case CONST.SEARCH.GROUP_BY.MEMBERS:
                    // s77rt
                    return null;
                default:
                    return null;
            }
        },
        [groupBy, groupItem, canSelectMultiple, isDisabledOrEmpty, isFocused, onCheckboxPress, onSelectRow, policy],
    );

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
                    {getHeader(hovered)}
                    {isEmpty ? (
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                            <Text
                                style={[styles.textLabelSupporting]}
                                numberOfLines={1}
                            >
                                {translate('search.moneyRequestReport.emptyStateTitle')}
                            </Text>
                        </View>
                    ) : (
                        groupItem.transactions.map((transaction) => (
                            <View>
                                <TransactionItemRow
                                    transactionItem={transaction}
                                    isSelected={!!transaction.isSelected}
                                    dateColumnSize={dateColumnSize}
                                    amountColumnSize={amountColumnSize}
                                    taxAmountColumnSize={taxAmountColumnSize}
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
                                    isReportItemChild
                                    isInSingleTransactionReport={groupItem.transactions.length === 1}
                                />
                            </View>
                        ))
                    )}
                </View>
            )}
        </BaseListItem>
    );
}

TransactionGroupListItem.displayName = 'TransactionGroupListItem';

export default TransactionGroupListItem;
