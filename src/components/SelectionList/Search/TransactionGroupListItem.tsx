import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchGroupBy} from '@components/Search/types';
import type {
    ListItem,
    TransactionCardGroupListItemType,
    TransactionGroupListItemProps,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionList/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getReportAction} from '@libs/ReportActionsUtils';
import {createAndOpenSearchTransactionThread, getColumnsToShow, getSections} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import {setActiveTransactionThreadIDs} from '@userActions/TransactionThreadNavigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import CardListItemHeader from './CardListItemHeader';
import MemberListItemHeader from './MemberListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';
import WithdrawalIDListItemHeader from './WithdrawalIDListItemHeader';

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
    columns,
    groupBy,
    accountID,
    isOffline,
    areAllOptionalColumnsHidden: areAllOptionalColumnsHiddenProp,
}: TransactionGroupListItemProps<TItem>) {
    const groupItem = item as unknown as TransactionGroupListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {selectedTransactions, currentSearchHash} = useSearchContext();
    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const selectedTransactionIDsSet = useMemo(() => new Set(selectedTransactionIDs), [selectedTransactionIDs]);
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`, {canBeMissing: true});
    const transactionsSnapshotMetadata = useMemo(() => {
        return transactionsSnapshot?.search;
    }, [transactionsSnapshot]);
    const isGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
    const transactions = useMemo(() => {
        if (isGroupByReports) {
            return groupItem.transactions;
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        const sectionData = getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, transactionsSnapshot?.data, accountID, formatPhoneNumber) as TransactionListItemType[];
        return sectionData.map((transactionItem) => ({
            ...transactionItem,
            isSelected: selectedTransactionIDsSet.has(transactionItem.transactionID),
        }));
    }, [isGroupByReports, transactionsSnapshot?.data, accountID, formatPhoneNumber, groupItem.transactions, selectedTransactionIDsSet]);

    const currentColumns = useMemo(() => {
        if (isGroupByReports) {
            return columns ?? [];
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        const columnsToShow = getColumnsToShow(accountID, transactionsSnapshot?.data, false, transactionsSnapshot?.search.type === CONST.SEARCH.DATA_TYPES.TASK);

        return (Object.keys(columnsToShow) as SearchColumnType[]).filter((col) => columnsToShow[col]);
    }, [accountID, columns, isGroupByReports, transactionsSnapshot?.data, transactionsSnapshot?.search.type]);

    const areAllOptionalColumnsHidden = useMemo(() => {
        if (isGroupByReports) {
            return areAllOptionalColumnsHiddenProp ?? false;
        }
        const canBeMissingColumns = getExpenseHeaders(groupBy)
            .filter((header) => header.canBeMissing)
            .map((header) => header.columnName);
        return canBeMissingColumns.every((column) => !currentColumns.includes(column));
    }, [areAllOptionalColumnsHiddenProp, currentColumns, groupBy, isGroupByReports]);

    const selectedItemsLength = useMemo(() => {
        return transactions.reduce((acc, transaction) => {
            return transaction.isSelected ? acc + 1 : acc;
        }, 0);
    }, [transactions]);

    const transactionsWithoutPendingDelete = useMemo(() => {
        return transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [transactions]);

    const isSelectAllChecked = selectedItemsLength === transactions.length && transactions.length > 0;
    const isIndeterminate = selectedItemsLength > 0 && selectedItemsLength !== transactionsWithoutPendingDelete.length;

    const [isExpanded, setIsExpanded] = useState(false);

    const isEmpty = transactions.length === 0;
    const {translate} = useLocalize();
    const isEmpty = groupItem.transactions.length === 0;
    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayEmptyView = isEmpty && groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
    const isDisabledOrEmpty = isEmpty || isDisabled;
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        const isAmountColumnWide = groupItem.transactions.some((transaction) => transaction.isAmountColumnWide);
        const isTaxAmountColumnWide = groupItem.transactions.some((transaction) => transaction.isTaxAmountColumnWide);
        const shouldShowYearForSomeTransaction = groupItem.transactions.some((transaction) => transaction.shouldShowYear);
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

    const pressableStyle = [styles.transactionGroupListItemStyle, item.isSelected && styles.activeComponentBG];

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        const reportID = getReportIDForTransaction(transactionItem);
        const siblingTransactionThreadIDs = groupItem.transactions.map(getReportIDForTransaction);

        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        setActiveTransactionThreadIDs(siblingTransactionThreadIDs).then(() => {
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            if (transactionItem.transactionThreadReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                const iouAction = getReportAction(transactionItem.report.reportID, transactionItem.moneyRequestReportActionID);
                createAndOpenSearchTransactionThread(transactionItem, iouAction, currentSearchHash, backTo);
                return;
            }
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        });
    };

    const getHeader = useMemo(() => {
        const headers: Record<SearchGroupBy, React.JSX.Element> = {
            [CONST.SEARCH.GROUP_BY.REPORTS]: (
                <ReportListItemHeader
                    report={groupItem as TransactionReportGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.FROM]: (
                <MemberListItemHeader
                    member={groupItem as TransactionMemberGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.CARD]: (
                <CardListItemHeader
                    card={groupItem as TransactionCardGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: (
                <WithdrawalIDListItemHeader
                    withdrawalID={groupItem as TransactionWithdrawalIDGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
        };

        if (!groupBy) {
            return null;
        }

        return headers[groupBy];
    }, [groupItem, onSelectRow, onCheckboxPress, isDisabledOrEmpty, isFocused, canSelectMultiple, groupBy]);

    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    const onPress = useCallback(() => {
        onSelectRow(item);
    }, [item, onSelectRow]);

    const onLongPress = useCallback(() => {
        onLongPressRow?.(item);
    }, [item, onLongPressRow]);

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
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                onMouseDown={(e) => e.preventDefault()}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, animatedHighlightStyle, styles.userSelectNone]}
            >
                <View style={styles.flex1}>
                    {getHeader}
                    {shouldDisplayEmptyView ? (
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
                            <TransactionItemRow
                                key={transaction.transactionID}
                                report={transaction.report}
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
                                style={[styles.noBorderRadius, shouldUseNarrowLayout ? [styles.p3, styles.pt2] : [styles.ph3, styles.pv1Half]]}
                                isReportItemChild
                                isInSingleTransactionReport={groupItem.transactions.length === 1}
                                areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                            />
                        ))
                    )}
                </View>
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

TransactionGroupListItem.displayName = 'TransactionGroupListItem';

export default TransactionGroupListItem;
