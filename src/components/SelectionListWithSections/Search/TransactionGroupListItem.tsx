import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import AnimatedCollapsible from '@components/AnimatedCollapsible';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchGroupBy} from '@components/Search/types';
import type {
    ListItem,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemProps,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import type {TransactionPreviewData} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSections} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSetSelector} from '@src/selectors/ReportMetaData';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import CardListItemHeader from './CardListItemHeader';
import CategoryListItemHeader from './CategoryListItemHeader';
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
    searchType,
    accountID,
    isOffline,
    newTransactionID,
    violations,
    onDEWModalOpen,
    isDEWBetaEnabled,
}: TransactionGroupListItemProps<TItem>) {
    const groupItem = item as unknown as TransactionGroupListItemType;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {selectedTransactions} = useSearchContext();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const currentUserDetails = useCurrentUserPersonalDetails();

    const oneTransactionItem = groupItem.isOneTransactionReport ? groupItem.transactions.at(0) : undefined;
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`, {canBeMissing: true});
    const [oneTransactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionItem?.reportAction?.childReportID}`, {canBeMissing: true});
    const [oneTransaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(oneTransactionItem?.transactionID)}`, {canBeMissing: true});
    const parentReportActionSelector = useCallback(
        (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${oneTransactionItem?.reportAction?.reportActionID}`],
        [oneTransactionItem?.reportAction?.reportActionID],
    );
    const [parentReportAction] = originalUseOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`,
        {selector: parentReportActionSelector, canBeMissing: true},
        [oneTransactionItem],
    );
    const transactionPreviewData: TransactionPreviewData = useMemo(
        () => ({hasParentReport: !!parentReport, hasTransaction: !!oneTransaction, hasParentReportAction: !!parentReportAction, hasTransactionThreadReport: !!oneTransactionThreadReport}),
        [parentReport, oneTransaction, parentReportAction, oneTransactionThreadReport],
    );

    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const selectedTransactionIDsSet = useMemo(() => new Set(selectedTransactionIDs), [selectedTransactionIDs]);
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`, {canBeMissing: true});

    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const [transactionsVisibleLimit, setTransactionsVisibleLimit] = useState(CONST.TRANSACTION.RESULTS_PAGE_SIZE as number);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isActionLoadingSet = new Set<string>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}`, {canBeMissing: true, selector: isActionLoadingSetSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    const transactions = useMemo(() => {
        if (isExpenseReportType) {
            return groupItem.transactions;
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        const [sectionData] = getSections({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data: transactionsSnapshot?.data,
            currentAccountID: accountID,
            currentUserEmail: currentUserDetails.email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList,
            isActionLoadingSet,
        }) as [TransactionListItemType[], number];
        return sectionData.map((transactionItem) => ({
            ...transactionItem,
            isSelected: selectedTransactionIDsSet.has(transactionItem.transactionID),
        }));
    }, [
        isExpenseReportType,
        transactionsSnapshot?.data,
        accountID,
        translate,
        formatPhoneNumber,
        groupItem.transactions,
        selectedTransactionIDsSet,
        currentUserDetails.email,
        isActionLoadingSet,
        bankAccountList,
    ]);

    const selectedItemsLength = useMemo(() => {
        return transactions.reduce((acc, transaction) => {
            return transaction.isSelected ? acc + 1 : acc;
        }, 0);
    }, [transactions]);

    const transactionsWithoutPendingDelete = useMemo(() => {
        return transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [transactions]);

    const isEmpty = transactions.length === 0;

    const isEmptyReportSelected = isEmpty && item?.keyForList && selectedTransactions[item.keyForList]?.isSelected;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isSelectAllChecked = isEmptyReportSelected || (selectedItemsLength === transactionsWithoutPendingDelete.length && transactionsWithoutPendingDelete.length > 0);
    const isIndeterminate = selectedItemsLength > 0 && selectedItemsLength !== transactionsWithoutPendingDelete.length;

    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;
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
                isLoading: !!transactionsSnapshot?.search?.isLoading,
            });
        },
        [groupItem.transactionsQueryJSON, transactionsSnapshot?.search?.offset, transactionsSnapshot?.search?.isLoading],
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
            setTransactionsVisibleLimit(CONST.TRANSACTION.RESULTS_PAGE_SIZE);
        }
    }, [isExpanded]);

    const onPress = useCallback(() => {
        if (isExpenseReportType || transactions.length === 0) {
            onSelectRow(item, transactionPreviewData);
        }
        if (!isExpenseReportType) {
            handleToggle();
        }
    }, [isExpenseReportType, transactions.length, onSelectRow, transactionPreviewData, item, handleToggle]);

    const onLongPress = useCallback(() => {
        onLongPressRow?.(item, isExpenseReportType ? undefined : transactions);
    }, [isExpenseReportType, item, onLongPressRow, transactions]);

    const onExpandedRowLongPress = useCallback(
        (transaction: TransactionListItemType) => {
            onLongPressRow?.(transaction as unknown as TItem);
        },
        [onLongPressRow],
    );

    const onCheckboxPress = useCallback(
        (val: TItem) => {
            onCheckboxPressRow?.(val, isExpenseReportType ? undefined : transactions);
        },
        [onCheckboxPressRow, transactions, isExpenseReportType],
    );

    const onExpandIconPress = useCallback(() => {
        if (isEmpty && !shouldDisplayEmptyView) {
            onPress();
        } else if (groupItem.transactionsQueryJSON && !isExpanded) {
            searchTransactions();
        }
        handleToggle();
    }, [isEmpty, shouldDisplayEmptyView, groupItem.transactionsQueryJSON, isExpanded, handleToggle, onPress, searchTransactions]);

    const getHeader = useCallback(
        (hovered: boolean) => {
            const headers: Record<SearchGroupBy, React.JSX.Element> = {
                [CONST.SEARCH.GROUP_BY.FROM]: (
                    <MemberListItemHeader
                        member={groupItem as TransactionMemberGroupListItemType}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabledOrEmpty}
                        columns={columns}
                        canSelectMultiple={canSelectMultiple}
                        isSelectAllChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        onDownArrowClick={onExpandIconPress}
                        isExpanded={isExpanded}
                    />
                ),
                [CONST.SEARCH.GROUP_BY.CARD]: (
                    <CardListItemHeader
                        card={groupItem as TransactionCardGroupListItemType}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabledOrEmpty}
                        columns={columns}
                        isFocused={isFocused}
                        canSelectMultiple={canSelectMultiple}
                        isSelectAllChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        onDownArrowClick={onExpandIconPress}
                        isExpanded={isExpanded}
                    />
                ),
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: (
                    <WithdrawalIDListItemHeader
                        withdrawalID={groupItem as TransactionWithdrawalIDGroupListItemType}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabledOrEmpty}
                        columns={columns}
                        canSelectMultiple={canSelectMultiple}
                        isSelectAllChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        onDownArrowClick={onExpandIconPress}
                        isExpanded={isExpanded}
                    />
                ),
                [CONST.SEARCH.GROUP_BY.CATEGORY]: (
                    <CategoryListItemHeader
                        category={groupItem as TransactionCategoryGroupListItemType}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabledOrEmpty}
                        columns={columns}
                        canSelectMultiple={canSelectMultiple}
                        isSelectAllChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        onDownArrowClick={onExpandIconPress}
                        isExpanded={isExpanded}
                    />
                ),
            };

            if (searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
                return (
                    <ReportListItemHeader
                        report={groupItem as TransactionReportGroupListItemType}
                        onSelectRow={(listItem) => onSelectRow(listItem, transactionPreviewData)}
                        onCheckboxPress={onCheckboxPress}
                        isDisabled={isDisabled}
                        isFocused={isFocused}
                        canSelectMultiple={canSelectMultiple}
                        isSelectAllChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        isHovered={hovered}
                        onDEWModalOpen={onDEWModalOpen}
                        isDEWBetaEnabled={isDEWBetaEnabled}
                        onDownArrowClick={onExpandIconPress}
                        isExpanded={isExpanded}
                    />
                );
            }

            if (!groupBy) {
                return null;
            }

            return headers[groupBy];
        },
        [
            groupItem,
            onCheckboxPress,
            isDisabledOrEmpty,
            columns,
            canSelectMultiple,
            isSelectAllChecked,
            isIndeterminate,
            onExpandIconPress,
            isExpanded,
            isFocused,
            searchType,
            groupBy,
            isDisabled,
            onDEWModalOpen,
            isDEWBetaEnabled,
            onSelectRow,
            transactionPreviewData,
        ],
    );

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const pendingAction =
        item.pendingAction ??
        (groupItem.transactions.length > 0 && groupItem.transactions.every((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
            : undefined);

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
                {({hovered}) => (
                    <View style={styles.flex1}>
                        <AnimatedCollapsible
                            isExpanded={isExpanded}
                            header={getHeader(hovered)}
                            onPress={onExpandIconPress}
                            expandButtonStyle={styles.pv4Half}
                            shouldShowToggleButton={isLargeScreenWidth}
                        >
                            <TransactionGroupListExpandedItem
                                showTooltip={showTooltip}
                                canSelectMultiple={canSelectMultiple}
                                onCheckboxPress={onCheckboxPress}
                                columns={columns}
                                groupBy={groupBy}
                                accountID={accountID}
                                isOffline={isOffline}
                                violations={violations}
                                transactions={transactions}
                                transactionsVisibleLimit={transactionsVisibleLimit}
                                setTransactionsVisibleLimit={setTransactionsVisibleLimit}
                                isEmpty={isEmpty}
                                shouldDisplayEmptyView={shouldDisplayEmptyView}
                                isExpenseReportType={isExpenseReportType}
                                transactionsSnapshot={transactionsSnapshot}
                                transactionsQueryJSON={groupItem.transactionsQueryJSON}
                                searchTransactions={searchTransactions}
                                isInSingleTransactionReport={groupItem.transactions.length === 1}
                                onLongPress={onExpandedRowLongPress}
                            />
                        </AnimatedCollapsible>
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionGroupListItem;
