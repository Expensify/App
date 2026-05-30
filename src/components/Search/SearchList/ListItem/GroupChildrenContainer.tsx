import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {easing} from '@components/Modal/ReanimatedModal/utils';
import {useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {getSections} from '@libs/SearchUIUtils';
import {mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import TransactionGroupListExpandedItem from './TransactionGroupListExpanded';
import type {GroupChildrenContainerItemType, SearchListItem, TransactionGroupListItemType, TransactionListItemType} from './types';

type GroupChildrenContainerProps = {
    item: GroupChildrenContainerItemType;
    isExpanded: boolean;
    groupBy?: SearchGroupBy;
    searchType?: SearchDataTypes;
    columns?: SearchColumnType[];
    canSelectMultiple: boolean;
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onCheckboxPress: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    onLongPressRow?: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    nonPersonalAndWorkspaceCards?: CardList;
    onUndelete?: (transaction: Transaction) => void;
    isLastItem?: boolean;
};

function GroupChildrenContainer({
    item,
    isExpanded,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    nonPersonalAndWorkspaceCards,
    onUndelete,
    isLastItem,
}: GroupChildrenContainerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {selectedTransactions} = useSearchSelectionContext();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isScreenFocused = useIsFocused();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const groupItem = item as unknown as TransactionGroupListItemType;
    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const selectedTransactionIDsSet = new Set(Object.keys(selectedTransactions));
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`);
    const [transactionsVisibleLimit, setTransactionsVisibleLimit] = useState(CONST.TRANSACTION.RESULTS_PAGE_SIZE as number);
    const isActionLoadingSet = useActionLoadingReportIDs();
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

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
            conciergeReportID,
            convertToDisplayString,
        }) as [TransactionListItemType[], number, boolean];
        transactions = sectionData.map((transactionItem) => ({
            ...transactionItem,
            isSelected: selectedTransactionIDsSet.has(transactionItem.transactionID),
        }));
    }

    const isEmpty = transactions.length === 0;
    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;

    const refreshTransactions = () => {
        if (!groupItem.transactionsQueryJSON) {
            return;
        }
        search({
            queryJSON: groupItem.transactionsQueryJSON,
            searchKey: undefined,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: !!transactionsSnapshot?.search?.isLoading,
            isOffline,
        });
    };

    const searchTransactions = (pageSize = 0) => {
        if (!groupItem.transactionsQueryJSON) {
            return;
        }
        search({
            queryJSON: groupItem.transactionsQueryJSON,
            searchKey: undefined,
            offset: (transactionsSnapshot?.search?.offset ?? 0) + pageSize,
            shouldCalculateTotals: false,
            isLoading: !!transactionsSnapshot?.search?.isLoading,
            isOffline,
        });
    };

    useEffect(() => {
        if (!isExpanded || isExpenseReportType) {
            return;
        }
        refreshTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const wasScreenFocusedRef = React.useRef(isScreenFocused);
    useEffect(() => {
        const didReturnToScreen = wasScreenFocusedRef.current === false && isScreenFocused === true;
        wasScreenFocusedRef.current = isScreenFocused;
        if (!didReturnToScreen || !isExpanded || isExpenseReportType) {
            return;
        }
        refreshTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScreenFocused]);

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

    const onExpandedRowLongPress = (transaction: TransactionListItemType) => {
        onLongPressRow?.(transaction, transactions);
    };

    // Animation: replicate AnimatedCollapsible's height animation pattern
    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isRendered, setIsRendered] = useState(isExpanded);

    hasExpanded.set(isExpanded);
    if (isExpanded && !isRendered) {
        setIsRendered(true);
    }

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration: 300, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        });
    }, []);

    const animatedOpacity = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        return withTiming(hasExpanded.get() ? 1 : 0, {duration: 300, easing});
    });

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get(),
        opacity: animatedOpacity.get(),
    }));

    return (
        <View style={[styles.mh5, {backgroundColor: theme.highlightBG}, isLastItem && [styles.tableBottomRadius, styles.overflowHidden]]}>
            <Animated.View style={contentAnimatedStyle}>
                {isExpanded || isRendered ? (
                    <Animated.View
                        style={[styles.stickToTop, {paddingBottom: 4}]}
                        onLayout={(e) => {
                            const height = e.nativeEvent.layout.height;
                            if (height) {
                                contentHeight.set(height);
                            }
                        }}
                    >
                        {!isLargeScreenWidth && (
                            <View style={styles.ph3}>
                                <View style={styles.borderBottom} />
                            </View>
                        )}
                        <TransactionGroupListExpandedItem
                            showTooltip
                            canSelectMultiple={canSelectMultiple}
                            onSelectionButtonPress={onCheckboxPress}
                            onSelectRow={onSelectRow}
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
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            onUndelete={onUndelete}
                            hideSearchTableHeader
                        />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </View>
    );
}

export default GroupChildrenContainer;
