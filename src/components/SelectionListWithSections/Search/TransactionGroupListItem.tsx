import React, {useEffect, useRef, useState} from 'react';
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
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from '@components/SelectionListWithSections/types';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
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
import {mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import CardListItemHeader from './CardListItemHeader';
import CategoryListItemHeader from './CategoryListItemHeader';
import MemberListItemHeader from './MemberListItemHeader';
import MerchantListItemHeader from './MerchantListItemHeader';
import MonthListItemHeader from './MonthListItemHeader';
import QuarterListItemHeader from './QuarterListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';
import TagListItemHeader from './TagListItemHeader';
import TransactionGroupListExpandedItem from './TransactionGroupListExpanded';
import WeekListItemHeader from './WeekListItemHeader';
import WithdrawalIDListItemHeader from './WithdrawalIDListItemHeader';
import YearListItemHeader from './YearListItemHeader';

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
    isOffline,
    newTransactionID,
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
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`);
    const [oneTransactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionItem?.reportAction?.childReportID}`);
    const [oneTransaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(oneTransactionItem?.transactionID)}`);
    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${oneTransactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`, {selector: parentReportActionSelector}, [
        oneTransactionItem,
    ]);
    const transactionPreviewData: TransactionPreviewData = {
        hasParentReport: !!parentReport,
        hasTransaction: !!oneTransaction,
        hasParentReportAction: !!parentReportAction,
        hasTransactionThreadReport: !!oneTransactionThreadReport,
    };

    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const selectedTransactionIDsSet = new Set(selectedTransactionIDs);
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`);

    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const [transactionsVisibleLimit, setTransactionsVisibleLimit] = useState(CONST.TRANSACTION.RESULTS_PAGE_SIZE as number);
    const [isExpanded, setIsExpanded] = useState(false);
    const isActionLoadingSet = useActionLoadingReportIDs();
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    let transactions: TransactionListItemType[];
    if (isExpenseReportType) {
        transactions = groupItem.transactions;
    } else if (!transactionsSnapshot?.data) {
        transactions = [];
    } else {
        const [sectionData] = getSections({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data: transactionsSnapshot?.data,
            currentAccountID: currentUserDetails.accountID,
            currentUserEmail: currentUserDetails.email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList,
            isActionLoadingSet,
            allReportMetadata,
            cardFeeds,
            cardList,
        }) as [TransactionListItemType[], number];
        transactions = sectionData.map((transactionItem) => ({
            ...transactionItem,
            isSelected: selectedTransactionIDsSet.has(transactionItem.transactionID),
        }));
    }

    const selectedItemsLength = transactions.reduce((acc, transaction) => (transaction.isSelected ? acc + 1 : acc), 0);

    const transactionsWithoutPendingDelete = transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const isEmpty = transactions.length === 0;

    const isEmptyReportSelected = isEmpty && item?.keyForList && selectedTransactions[item.keyForList]?.isSelected;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isSelectAllChecked = isEmptyReportSelected || (selectedItemsLength === transactionsWithoutPendingDelete.length && transactionsWithoutPendingDelete.length > 0);
    const isIndeterminate = selectedItemsLength > 0 && selectedItemsLength !== transactionsWithoutPendingDelete.length;

    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;
    const isDisabledOrEmpty = isEmpty || isDisabled;

    // Search transactions - handles both refresh (offset 0) and pagination (current offset + pageSize)
    const searchTransactions = (pageSize = 0, isRefresh = false) => {
        if (!groupItem.transactionsQueryJSON) {
            return;
        }

        search({
            queryJSON: groupItem.transactionsQueryJSON,
            searchKey: undefined,
            offset: isRefresh ? 0 : (transactionsSnapshot?.search?.offset ?? 0) + pageSize,
            shouldCalculateTotals: false,
            isLoading: !!transactionsSnapshot?.search?.isLoading,
            isOffline,
        });
    };

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
        searchTransactions(0, true);
    }, [newTransactionID, isExpanded, searchTransactions]);

    const handleToggle = () => {
        setIsExpanded((prev) => {
            const newExpandedState = !prev;

            if (newExpandedState) {
                searchTransactions(0, true);
            } else {
                setTransactionsVisibleLimit(CONST.TRANSACTION.RESULTS_PAGE_SIZE);
            }

            return newExpandedState;
        });
    };

    const onPress = () => {
        if (isExpenseReportType || transactions.length === 0) {
            onSelectRow(item, transactionPreviewData);
        }
        if (!isExpenseReportType) {
            handleToggle();
        }
    };

    const onLongPress = () => {
        onLongPressRow?.(item, isExpenseReportType ? undefined : transactions);
    };

    const onExpandedRowLongPress = (transaction: TransactionListItemType) => {
        onLongPressRow?.(transaction as unknown as TItem);
    };

    const onCheckboxPress = (val: TItem) => {
        onCheckboxPressRow?.(val, isExpenseReportType ? undefined : transactions);
    };

    const onExpandIconPress = () => {
        if (isEmpty && !shouldDisplayEmptyView) {
            onPress();
            // onPress handles handleToggle() for us, so we return early to avoid calling it twice
            return;
        }
        handleToggle();
    };

    const getHeader = (hovered: boolean) => {
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
            [CONST.SEARCH.GROUP_BY.MERCHANT]: (
                <MerchantListItemHeader
                    merchant={groupItem as TransactionMerchantGroupListItemType}
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
            [CONST.SEARCH.GROUP_BY.TAG]: (
                <TagListItemHeader
                    tag={groupItem as TransactionTagGroupListItemType}
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
            [CONST.SEARCH.GROUP_BY.MONTH]: (
                <MonthListItemHeader
                    month={groupItem as TransactionMonthGroupListItemType}
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
            [CONST.SEARCH.GROUP_BY.WEEK]: (
                <WeekListItemHeader
                    week={groupItem as TransactionWeekGroupListItemType}
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
            [CONST.SEARCH.GROUP_BY.YEAR]: (
                <YearListItemHeader
                    year={groupItem as TransactionYearGroupListItemType}
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
            [CONST.SEARCH.GROUP_BY.QUARTER]: (
                <QuarterListItemHeader
                    quarter={groupItem as TransactionQuarterGroupListItemType}
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
    };

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const pendingAction =
        item.pendingAction ??
        (groupItem.transactions.length > 0 && groupItem.transactions.every((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
            : undefined);

    const snapshotData = transactionsSnapshot?.data;
    const groupViolations: Record<string, TransactionViolations | undefined> = {};
    if (snapshotData) {
        for (const [key, value] of Object.entries(snapshotData)) {
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS)) {
                groupViolations[key] = value as TransactionViolations;
            }
        }
    }

    const filteredViolations: Record<string, TransactionViolation[]> = {};
    if (snapshotData) {
        for (const key of Object.keys(snapshotData)) {
            if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                continue;
            }
            const snapshotTransaction = snapshotData[key as keyof typeof snapshotData] as Transaction;
            if (!snapshotTransaction || typeof snapshotTransaction !== 'object' || !('transactionID' in snapshotTransaction) || !('reportID' in snapshotTransaction)) {
                continue;
            }

            const report = snapshotData[`${ONYXKEYS.COLLECTION.REPORT}${snapshotTransaction.reportID}`];
            const policy = snapshotData[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

            if (report && policy) {
                const transactionViolations = groupViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${snapshotTransaction.transactionID}`];
                if (transactionViolations) {
                    const merged = mergeProhibitedViolations(
                        transactionViolations.filter((violation) => shouldShowViolation(report, policy, violation.name, currentUserDetails?.email ?? '', true, snapshotTransaction)),
                    );
                    if (merged.length > 0) {
                        filteredViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${snapshotTransaction.transactionID}`] = merged;
                    }
                }
            }
        }
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={onLongPress}
                onPress={onPress}
                disabled={isDisabled && !isItemSelected}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_GROUP_LIST_ITEM}
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
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.GROUP_EXPAND_TOGGLE}
                        >
                            <TransactionGroupListExpandedItem
                                showTooltip={showTooltip}
                                canSelectMultiple={canSelectMultiple}
                                onCheckboxPress={onCheckboxPress}
                                columns={columns}
                                groupBy={groupBy}
                                accountID={currentUserDetails.accountID}
                                isOffline={isOffline}
                                violations={filteredViolations}
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
