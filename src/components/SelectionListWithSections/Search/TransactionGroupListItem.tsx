import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import AnimatedCollapsible from '@components/AnimatedCollapsible';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchContext} from '@components/Search/SearchContext';
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
} from '@components/SelectionListWithSections/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import {getSections} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import CardListItemHeader from './CardListItemHeader';
import MemberListItemHeader from './MemberListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';
import TransactionGroupListExpandedItem from './TransactionGroupListExpanded';
import WithdrawalIDListItemHeader from './WithdrawalIDListItemHeader';

function TransactionGroupListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onCheckboxPress: onCheckboxPressRow,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    columns,
    groupBy,
    accountID,
    isOffline,
    areAllOptionalColumnsHidden,
    newTransactionID,
    violations,
}: TransactionGroupListItemProps<TItem>) {
    const groupItem = item as unknown as TransactionGroupListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {formatPhoneNumber} = useLocalize();
    const {selectedTransactions} = useSearchContext();
    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const selectedTransactionIDsSet = useMemo(() => new Set(selectedTransactionIDs), [selectedTransactionIDs]);
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`, {canBeMissing: true});

    const isGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
    const [transactionsVisibleLimit, setTransactionsVisibleLimit] = useState(CONST.SEARCH.RESULTS_PAGE_SIZE as number);
    const [isExpanded, setIsExpanded] = useState(false);

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

    const isEmpty = transactions.length === 0;
    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayEmptyView = isEmpty && isGroupByReports;
    const isDisabledOrEmpty = isEmpty || isDisabled;

    const searchTransactions = useCallback(
        (pageSize = 0) => {
            if (!groupItem.transactionsQueryJSON) {
                return;
            }

            search({
                queryJSON: groupItem.transactionsQueryJSON,
                searchKey: undefined,
                offset: (transactionsSnapshot?.search?.offset ?? 0) + pageSize,
                shouldCalculateTotals: false,
            });
        },
        [groupItem.transactionsQueryJSON, transactionsSnapshot?.search?.offset],
    );

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const isItemSelected = isSelectAllChecked || item?.isSelected;

    const pressableStyle = [styles.transactionGroupListItemStyle, isItemSelected && styles.activeComponentBG];

    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    useEffect(() => {
        if (!newTransactionID || !isExpanded) {
            return;
        }
        searchTransactions();
    }, [newTransactionID, isExpanded, searchTransactions]);

    const handleToggle = useCallback(() => {
        setIsExpanded(!isExpanded);
        if (isExpanded) {
            setTransactionsVisibleLimit(CONST.SEARCH.RESULTS_PAGE_SIZE);
        }
    }, [isExpanded]);

    const onPress = useCallback(() => {
        if (isGroupByReports || transactions.length === 0) {
            onSelectRow(item);
        }
        if (!isGroupByReports) {
            handleToggle();
        }
    }, [isGroupByReports, transactions.length, onSelectRow, item, handleToggle]);

    const onLongPress = useCallback(() => {
        if (isEmpty) {
            return;
        }
        onLongPressRow?.(item);
    }, [isEmpty, item, onLongPressRow]);

    const onCheckboxPress = useCallback(
        (val: TItem) => {
            onCheckboxPressRow?.(val, isGroupByReports ? undefined : transactions);
        },
        [onCheckboxPressRow, transactions, isGroupByReports],
    );

    const onExpandIconPress = useCallback(() => {
        if (isEmpty && !shouldDisplayEmptyView) {
            onPress();
        } else if (groupItem.transactionsQueryJSON && !isExpanded) {
            searchTransactions();
        }
        handleToggle();
    }, [isEmpty, shouldDisplayEmptyView, groupItem.transactionsQueryJSON, isExpanded, handleToggle, onPress, searchTransactions]);

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
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                />
            ),
            [CONST.SEARCH.GROUP_BY.FROM]: (
                <MemberListItemHeader
                    member={groupItem as TransactionMemberGroupListItemType}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                />
            ),
            [CONST.SEARCH.GROUP_BY.CARD]: (
                <CardListItemHeader
                    card={groupItem as TransactionCardGroupListItemType}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                />
            ),
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: (
                <WithdrawalIDListItemHeader
                    withdrawalID={groupItem as TransactionWithdrawalIDGroupListItemType}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                />
            ),
        };

        if (!groupBy) {
            return null;
        }

        return headers[groupBy];
    }, [groupItem, onSelectRow, onCheckboxPress, isDisabledOrEmpty, isFocused, canSelectMultiple, isSelectAllChecked, isIndeterminate, groupBy]);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const pendingAction =
        (item.pendingAction ?? (groupItem.transactions.length > 0 && groupItem.transactions.every((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)))
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
            : undefined;

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={onLongPress}
                onPress={onPress}
                disabled={isDisabled && !isItemSelected}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, isItemSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                onMouseDown={(e) => e.preventDefault()}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!isItemSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, animatedHighlightStyle, styles.userSelectNone]}
            >
                <View style={styles.flex1}>
                    <AnimatedCollapsible
                        isExpanded={isExpanded}
                        header={getHeader}
                        onPress={onExpandIconPress}
                        expandButtonStyle={styles.pv4Half}
                    >
                        {isExpanded ? (
                            <TransactionGroupListExpandedItem
                                showTooltip={showTooltip}
                                canSelectMultiple={canSelectMultiple}
                                onCheckboxPress={onCheckboxPress}
                                columns={columns}
                                groupBy={groupBy}
                                accountID={accountID}
                                isOffline={isOffline}
                                areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                                violations={violations}
                                transactions={transactions}
                                transactionsVisibleLimit={transactionsVisibleLimit}
                                setTransactionsVisibleLimit={setTransactionsVisibleLimit}
                                isEmpty={isEmpty}
                                shouldDisplayEmptyView={shouldDisplayEmptyView}
                                isGroupByReports={isGroupByReports}
                                transactionsSnapshot={transactionsSnapshot}
                                transactionsQueryJSON={groupItem.transactionsQueryJSON}
                                searchTransactions={searchTransactions}
                                isInSingleTransactionReport={groupItem.transactions.length === 1}
                            />
                        ) : null}
                    </AnimatedCollapsible>
                </View>
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

TransactionGroupListItem.displayName = 'TransactionGroupListItem';

export default TransactionGroupListItem;
