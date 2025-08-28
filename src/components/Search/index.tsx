import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import type {ContentStyle} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SearchTableHeader, {expenseHeaders} from '@components/SelectionList/SearchTableHeader';
import type {ReportActionListItemType, SearchListItem, SelectionListHandle, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionList/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {openSearch, updateSearchResultsWithTransactionThreadReportID} from '@libs/actions/Search';
import Timing from '@libs/actions/Timing';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import Performance from '@libs/Performance';
import {getIOUActionForTransactionID, isExportIntegrationAction, isIntegrationMessageAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, generateReportID, isArchivedReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {
    getColumnsToShow,
    getListItem,
    getSections,
    getSortedSections,
    getSuggestedSearches,
    getWideAmountIndicators,
    isReportActionListItemType,
    isSearchDataLoaded,
    isSearchResultsEmpty as isSearchResultsEmptyUtil,
    isTaskListItemType,
    isTransactionCardGroupListItemType,
    isTransactionGroupListItemType,
    isTransactionListItemType,
    isTransactionMemberGroupListItemType,
    isTransactionWithdrawalIDGroupListItemType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import type {ArchivedReportsIDSet, SearchKey} from '@libs/SearchUIUtils';
import {isOnHold, isTransactionPendingDelete} from '@libs/TransactionUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {OutstandingReportsByPolicyIDDerivedValue, ReportAction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import {useSearchContext} from './SearchContext';
import SearchList from './SearchList';
import SearchScopeProvider from './SearchScopeProvider';
import type {SearchColumnType, SearchParams, SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: ContentStyle;
    searchResults?: SearchResults;
    handleSearch: (value: SearchParams) => void;
    isMobileSelectionModeEnabled: boolean;
};

function mapTransactionItemToSelectedEntry(
    item: TransactionListItemType,
    reportActions: ReportAction[],
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
): [string, SelectedTransactionInfo] {
    return [
        item.keyForList,
        {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: item.canHold,
            isHeld: isOnHold(item),
            canUnhold: item.canUnhold,
            canChangeReport: canEditFieldOfMoneyRequest(
                getIOUActionForTransactionID(reportActions, item.transactionID),
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
            ),
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: item.modifiedAmount ?? item.amount,
        },
    ];
}

function mapToTransactionItemWithAdditionalInfo(item: TransactionListItemType, selectedTransactions: SelectedTransactions, canSelectMultiple: boolean, shouldAnimateInHighlight: boolean) {
    return {...item, shouldAnimateInHighlight, isSelected: selectedTransactions[item.keyForList]?.isSelected && canSelectMultiple};
}

function mapToItemWithAdditionalInfo(item: SearchListItem, selectedTransactions: SelectedTransactions, canSelectMultiple: boolean, shouldAnimateInHighlight: boolean) {
    if (isTaskListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
        };
    }

    if (isReportActionListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
        };
    }

    return isTransactionListItemType(item)
        ? mapToTransactionItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)
        : {
              ...item,
              shouldAnimateInHighlight,
              transactions: item.transactions?.map((transaction) => mapToTransactionItemWithAdditionalInfo(transaction, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)),
              isSelected:
                  item?.transactions?.length > 0 &&
                  item.transactions?.filter((t) => !isTransactionPendingDelete(t)).every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected && canSelectMultiple),
          };
}

function prepareTransactionsList(
    item: TransactionListItemType,
    selectedTransactions: SelectedTransactions,
    reportActions: ReportAction[],
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    return {
        ...selectedTransactions,
        [item.keyForList]: {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: item.canHold,
            isHeld: isOnHold(item),
            canUnhold: item.canUnhold,
            canChangeReport: canEditFieldOfMoneyRequest(
                getIOUActionForTransactionID(reportActions, item.transactionID),
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
            ),
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: Math.abs(item.modifiedAmount || item.amount),
        },
    };
}

function Search({queryJSON, searchResults, onSearchListScroll, contentContainerStyle, handleSearch, isMobileSelectionModeEnabled}: SearchProps) {
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {
        setCurrentSearchHashAndKey,
        setSelectedTransactions,
        selectedTransactions,
        clearSelectedTransactions,
        shouldTurnOffSelectionMode,
        setShouldShowFiltersBarLoading,
        lastSearchType,
        shouldShowSelectAllMatchingItems,
        areAllMatchingItemsSelected,
        selectAllMatchingItems,
        shouldResetSearchQuery,
        setShouldResetSearchQuery,
    } = useSearchContext();
    const [offset, setOffset] = useState(0);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});

    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: (all): ArchivedReportsIDSet => {
            const ids = new Set<string>();
            if (!all) {
                return ids;
            }

            const prefixLength = ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS.length;
            for (const [key, value] of Object.entries(all)) {
                if (isArchivedReport(value)) {
                    const reportID = key.slice(prefixLength);
                    ids.add(reportID);
                }
            }
            return ids;
        },
    });

    // Create a selector for only the reportActions needed to determine if a report has been exported or not, grouped by report
    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        canBeMissing: true,
        selector: (allReportActions) => {
            return Object.fromEntries(
                Object.entries(allReportActions ?? {}).map(([reportID, reportActionsGroup]) => {
                    const filteredReportActions = Object.values(reportActionsGroup ?? {}).filter((action) => isExportIntegrationAction(action) || isIntegrationMessageAction(action));
                    return [reportID, filteredReportActions];
                }),
            );
        },
    });
    const {defaultCardFeed} = useCardFeedsForDisplay();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: (s) => s?.accountID});
    const suggestedSearches = useMemo(() => getSuggestedSearches(defaultCardFeed?.id, accountID), [defaultCardFeed?.id, accountID]);

    const {type, status, sortBy, sortOrder, hash, similarSearchHash, groupBy} = queryJSON;
    const searchKey = useMemo(() => Object.values(suggestedSearches).find((search) => search.similarSearchHash === similarSearchHash)?.key, [suggestedSearches, similarSearchHash]);

    const shouldCalculateTotals = useMemo(() => {
        if (offset !== 0) {
            return false;
        }
        if (!searchKey) {
            return false;
        }

        const eligibleSearchKeys: Partial<SearchKey[]> = [
            CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
            CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
        ];
        return eligibleSearchKeys.includes(searchKey);
    }, [offset, searchKey]);

    const previousReportActions = usePrevious(reportActions);
    const reportActionsArray = useMemo(
        () =>
            Object.values(reportActions ?? {})
                .filter((reportAction) => !!reportAction)
                .flatMap((filteredReportActions) => Object.values(filteredReportActions ?? {})),
        [reportActions],
    );
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const searchListRef = useRef<SelectionListHandle | null>(null);

    const clearTransactionsAndSetHashAndKey = useCallback(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHashAndKey(hash, searchKey);
    }, [hash, searchKey, clearSelectedTransactions, setCurrentSearchHashAndKey]);

    useFocusEffect(clearTransactionsAndSetHashAndKey);

    useEffect(() => {
        clearTransactionsAndSetHashAndKey();

        // Trigger once on mount (e.g., on page reload), when RHP is open and screen is not focused
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (selectedKeys.length === 0 && isMobileSelectionModeEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }

        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTransactions, isMobileSelectionModeEnabled, shouldTurnOffSelectionMode]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0 && isMobileSelectionModeEnabled) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (selectedKeys.length > 0 && !isMobileSelectionModeEnabled && !isSearchResultsEmpty) {
            turnOnMobileSelectionMode();
        }
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, selectedTransactions, isMobileSelectionModeEnabled]);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        const isMigratedModalDisplayed = focusedRoute?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR || focusedRoute?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;

        if ((!isFocused && !isMigratedModalDisplayed) || isOffline) {
            return;
        }

        handleSearch({queryJSON, searchKey, offset, shouldCalculateTotals});
        // We don't need to run the effect on change of isFocused.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSearch, isOffline, offset, queryJSON, searchKey, shouldCalculateTotals]);

    useEffect(() => {
        openSearch();
    }, []);

    const {newSearchResultKey, handleSelectionListScroll} = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);

    const shouldShowLoadingState = !isOffline && (!isDataLoaded || (!!searchResults?.search.isLoading && Array.isArray(searchResults?.data) && searchResults?.data.length === 0));
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const data = useMemo(() => {
        if (searchResults === undefined || !isDataLoaded) {
            return [];
        }

        // Group-by option cannot be used for chats or tasks
        const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
        const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
        if (groupBy && (isChat || isTask)) {
            return [];
        }

        return getSections(type, searchResults.data, accountID, formatPhoneNumber, groupBy, exportReportActions, searchKey, archivedReportsIdSet);
    }, [searchKey, exportReportActions, groupBy, isDataLoaded, searchResults, type, archivedReportsIdSet, formatPhoneNumber, accountID]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowFiltersBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowFiltersBarLoading, shouldShowLoadingState, type]);

    // When new data load, selectedTransactions is updated in next effect. We use this flag to whether selection is updated
    const isRefreshingSelection = useRef(false);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        const newTransactionList: SelectedTransactions = {};
        if (groupBy) {
            data.forEach((transactionGroup) => {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    return;
                }
                transactionGroup.transactions.forEach((transaction) => {
                    if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !areAllMatchingItemsSelected) {
                        return;
                    }
                    newTransactionList[transaction.transactionID] = {
                        action: transaction.action,
                        canHold: transaction.canHold,
                        isHeld: isOnHold(transaction),
                        canUnhold: transaction.canUnhold,
                        canChangeReport: canEditFieldOfMoneyRequest(
                            getIOUActionForTransactionID(reportActionsArray, transaction.transactionID),
                            CONST.EDIT_REQUEST_FIELD.REPORT,
                            undefined,
                            undefined,
                            outstandingReportsByPolicyID,
                        ),
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: areAllMatchingItemsSelected || selectedTransactions[transaction.transactionID].isSelected,
                        canDelete: transaction.canDelete,
                        reportID: transaction.reportID,
                        policyID: transaction.policyID,
                        amount: transaction.modifiedAmount ?? transaction.amount,
                    };
                });
            });
        } else {
            data.forEach((transaction) => {
                if (!Object.hasOwn(transaction, 'transactionID') || !('transactionID' in transaction)) {
                    return;
                }
                if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !areAllMatchingItemsSelected) {
                    return;
                }
                newTransactionList[transaction.transactionID] = {
                    action: transaction.action,
                    canHold: transaction.canHold,
                    isHeld: isOnHold(transaction),
                    canUnhold: transaction.canUnhold,
                    canChangeReport: canEditFieldOfMoneyRequest(
                        getIOUActionForTransactionID(reportActionsArray, transaction.transactionID),
                        CONST.EDIT_REQUEST_FIELD.REPORT,
                        undefined,
                        undefined,
                        outstandingReportsByPolicyID,
                    ),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: areAllMatchingItemsSelected || selectedTransactions[transaction.transactionID].isSelected,
                    canDelete: transaction.canDelete,
                    reportID: transaction.reportID,
                    policyID: transaction.policyID,
                    amount: transaction.modifiedAmount ?? transaction.amount,
                };
            });
        }
        if (isEmptyObject(newTransactionList)) {
            return;
        }

        setSelectedTransactions(newTransactionList, data);

        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [data, setSelectedTransactions, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID]);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    useEffect(
        () => () => {
            if (isSearchTopmostFullScreenRoute()) {
                return;
            }
            clearSelectedTransactions();
            turnOffMobileSelectionMode();
        },
        [isFocused, clearSelectedTransactions],
    );

    // When selectedTransactions is updated, we confirm that selection is refreshed
    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!data.length || isRefreshingSelection.current) {
            return;
        }
        const areItemsGrouped = !!groupBy;
        const flattenedItems = areItemsGrouped ? (data as TransactionGroupListItemType[]).flatMap((item) => item.transactions) : data;
        const areAllItemsSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        // If the user has selected all the expenses in their view but there are more expenses matched by the search
        // give them the option to select all matching expenses
        shouldShowSelectAllMatchingItems(!!(areAllItemsSelected && searchResults?.search?.hasMoreResults));
        if (!areAllItemsSelected) {
            selectAllMatchingItems(false);
        }
    }, [isFocused, data, searchResults?.search?.hasMoreResults, selectedTransactions, selectAllMatchingItems, shouldShowSelectAllMatchingItems, groupBy]);

    const toggleTransaction = useCallback(
        (item: SearchListItem) => {
            if (isReportActionListItemType(item)) {
                return;
            }
            if (isTaskListItemType(item)) {
                return;
            }
            if (isTransactionListItemType(item)) {
                if (!item.keyForList) {
                    return;
                }
                if (isTransactionPendingDelete(item)) {
                    return;
                }
                setSelectedTransactions(prepareTransactionsList(item, selectedTransactions, reportActionsArray, outstandingReportsByPolicyID), data);
                return;
            }

            if (item.transactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

                item.transactions.forEach((transaction) => {
                    delete reducedSelectedTransactions[transaction.keyForList];
                });

                setSelectedTransactions(reducedSelectedTransactions, data);
                return;
            }

            setSelectedTransactions(
                {
                    ...selectedTransactions,
                    ...Object.fromEntries(
                        item.transactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray, outstandingReportsByPolicyID)),
                    ),
                },
                data,
            );
        },
        [data, reportActionsArray, selectedTransactions, outstandingReportsByPolicyID, setSelectedTransactions],
    );

    const openReport = useCallback(
        (item: SearchListItem) => {
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(item);
                return;
            }

            if (isTransactionMemberGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.accountID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: newQuery}));
                return;
            }

            if (isTransactionCardGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.cardID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: newQuery}));
                return;
            }

            if (isTransactionWithdrawalIDGroupListItemType(item)) {
                return;
            }

            const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            const isTransactionItem = isTransactionListItemType(item);

            const reportID =
                isTransactionItem && (!item.isFromOneTransactionReport || isFromSelfDM) && item.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                    ? item.transactionThreadReportID
                    : item.reportID;

            if (!reportID) {
                return;
            }

            Performance.markStart(CONST.TIMING.OPEN_REPORT_SEARCH);
            Timing.start(CONST.TIMING.OPEN_REPORT_SEARCH);

            const backTo = Navigation.getActiveRoute();

            if (isTransactionGroupListItemType(item)) {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo}));
                return;
            }

            // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                const generatedReportID = generateReportID();
                updateSearchResultsWithTransactionThreadReportID(hash, item.transactionID, generatedReportID);
                Navigation.navigate(
                    ROUTES.SEARCH_REPORT.getRoute({
                        reportID: generatedReportID,
                        backTo,
                        moneyRequestReportActionID: item.moneyRequestReportActionID,
                        transactionID: item.transactionID,
                    }),
                );
                return;
            }

            if (isReportActionListItemType(item)) {
                const reportActionID = item.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        },
        [hash, isMobileSelectionModeEnabled, toggleTransaction, queryJSON],
    );

    const currentColumns = useMemo(() => {
        if (!searchResults?.data) {
            return [];
        }
        const columns = getColumnsToShow(accountID, searchResults?.data, false, searchResults?.search.type === CONST.SEARCH.DATA_TYPES.TASK);

        return (Object.keys(columns) as SearchColumnType[]).filter((col) => columns[col]);
    }, [accountID, searchResults?.data, searchResults?.search.type]);

    const opacity = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    const previousColumns = usePrevious(currentColumns);
    const [columnsToShow, setColumnsToShow] = useState<SearchColumnType[]>([]);

    // If columns have changed, trigger an animation before settings columnsToShow to prevent
    // new columns appearing before the fade out animation happens
    useEffect(() => {
        if ((previousColumns && currentColumns && arraysEqual(previousColumns, currentColumns)) || offset === 0 || isSmallScreenWidth) {
            setColumnsToShow(currentColumns);
            return;
        }

        opacity.set(
            withTiming(0, {duration: CONST.SEARCH.ANIMATION.FADE_DURATION}, () => {
                setColumnsToShow(currentColumns);
                opacity.set(withTiming(1, {duration: CONST.SEARCH.ANIMATION.FADE_DURATION}));
            }),
        );
    }, [previousColumns, currentColumns, setColumnsToShow, opacity, offset, isSmallScreenWidth]);

    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
    const canSelectMultiple =
        !isChat &&
        !isTask &&
        (!isSmallScreenWidth || isMobileSelectionModeEnabled) &&
        groupBy !== CONST.SEARCH.GROUP_BY.FROM &&
        groupBy !== CONST.SEARCH.GROUP_BY.CARD &&
        groupBy !== CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID;
    const ListItem = getListItem(type, status, groupBy);
    const sortedSelectedData = useMemo(
        () =>
            getSortedSections(type, status, data, localeCompare, sortBy, sortOrder, groupBy).map((item) => {
                const baseKey = isChat
                    ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(item as ReportActionListItemType).reportActionID}`
                    : `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;

                // Check if the base key matches the newSearchResultKey (TransactionListItemType)
                const isBaseKeyMatch = baseKey === newSearchResultKey;

                // Check if any transaction within the transactions array (TransactionGroupListItemType) matches the newSearchResultKey
                const isAnyTransactionMatch =
                    !isChat &&
                    (item as TransactionGroupListItemType)?.transactions?.some((transaction) => {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                        return transactionKey === newSearchResultKey;
                    });

                // Determine if either the base key or any transaction key matches
                const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

                return mapToItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight);
            }),
        [type, status, data, sortBy, sortOrder, groupBy, isChat, newSearchResultKey, selectedTransactions, canSelectMultiple, localeCompare],
    );

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    useEffect(() => {
        const currentRoute = Navigation.getActiveRouteWithoutParams();
        if (hasErrors && (currentRoute === '/' || (shouldResetSearchQuery && currentRoute === '/search'))) {
            // Use requestAnimationFrame to safely update navigation params without overriding the current route
            requestAnimationFrame(() => {
                Navigation.setParams({q: buildCannedSearchQuery()});
            });
            if (shouldResetSearchQuery) {
                setShouldResetSearchQuery(false);
            }
        }
    }, [hasErrors, queryJSON, searchResults, shouldResetSearchQuery, setShouldResetSearchQuery]);

    const fetchMoreResults = useCallback(() => {
        if (!isFocused || !searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
    }, [isFocused, offset, searchResults?.search?.hasMoreResults, shouldShowLoadingMoreItems, shouldShowLoadingState]);

    const toggleAllTransactions = useCallback(() => {
        const areItemsGrouped = !!groupBy;
        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            return;
        }

        if (areItemsGrouped) {
            setSelectedTransactions(
                Object.fromEntries(
                    (data as TransactionGroupListItemType[]).flatMap((item) =>
                        item.transactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray, outstandingReportsByPolicyID)),
                    ),
                ),
                data,
            );

            return;
        }

        setSelectedTransactions(
            Object.fromEntries(
                (data as TransactionListItemType[])
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray, outstandingReportsByPolicyID)),
            ),
            data,
        );
    }, [clearSelectedTransactions, data, groupBy, reportActionsArray, selectedTransactions, setSelectedTransactions, outstandingReportsByPolicyID]);

    const onLayout = useCallback(() => handleSelectionListScroll(sortedSelectedData, searchListRef.current), [handleSelectionListScroll, sortedSelectedData]);

    const areAllOptionalColumnsHidden = useMemo(() => {
        const canBeMissingColumns = expenseHeaders.filter((header) => header.canBeMissing).map((header) => header.columnName);
        return canBeMissingColumns.every((column) => !columnsToShow.includes(column));
    }, [columnsToShow]);

    if (shouldShowLoadingState) {
        return (
            <Animated.View
                entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                style={[styles.flex1]}
            >
                <SearchRowSkeleton
                    shouldAnimate
                    containerStyle={shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3}
                />
            </Animated.View>
        );
    }

    if (searchResults === undefined) {
        Log.alert('[Search] Undefined search type');
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    if (hasErrors) {
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <FullPageErrorView
                    shouldShow
                    subtitleStyle={styles.textSupporting}
                    title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
                    subtitle={translate('errorPage.subtitle')}
                />
            </View>
        );
    }

    const visibleDataLength = data.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length;
    if (shouldShowEmptyState(isDataLoaded, visibleDataLength, searchResults.search.type)) {
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView
                    similarSearchHash={similarSearchHash}
                    type={type}
                    groupBy={groupBy}
                    hasResults={searchResults.search.hasResults}
                />
            </View>
        );
    }

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
        navigation.setParams({q: newQuery});
    };

    const shouldShowYear = shouldShowYearUtil(searchResults?.data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(searchResults?.data);
    const shouldShowSorting = !groupBy;
    const shouldShowTableHeader = isLargeScreenWidth && !isChat;

    return (
        <SearchScopeProvider isOnSearch>
            <Animated.View style={[styles.flex1, animatedStyle]}>
                <SearchList
                    ref={searchListRef}
                    data={sortedSelectedData}
                    ListItem={ListItem}
                    onSelectRow={openReport}
                    onCheckboxPress={toggleTransaction}
                    onAllCheckboxPress={toggleAllTransactions}
                    canSelectMultiple={canSelectMultiple}
                    shouldPreventLongPressRow={isChat || isTask}
                    isFocused={isFocused}
                    SearchTableHeader={
                        !shouldShowTableHeader ? undefined : (
                            <SearchTableHeader
                                canSelectMultiple={canSelectMultiple}
                                columns={columnsToShow}
                                metadata={searchResults?.search}
                                onSortPress={onSortPress}
                                sortOrder={sortOrder}
                                sortBy={sortBy}
                                shouldShowYear={shouldShowYear}
                                isAmountColumnWide={shouldShowAmountInWideColumn}
                                isTaxAmountColumnWide={shouldShowTaxAmountInWideColumn}
                                shouldShowSorting={shouldShowSorting}
                                groupBy={groupBy}
                                areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                            />
                        )
                    }
                    contentContainerStyle={{...contentContainerStyle, ...styles.pb3}}
                    containerStyle={[styles.pv0, type === CONST.SEARCH.DATA_TYPES.CHAT && !isSmallScreenWidth && styles.pt3]}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onScroll={onSearchListScroll}
                    onEndReachedThreshold={0.75}
                    onEndReached={fetchMoreResults}
                    ListFooterComponent={
                        shouldShowLoadingMoreItems ? (
                            <SearchRowSkeleton
                                shouldAnimate
                                fixedNumItems={5}
                            />
                        ) : undefined
                    }
                    queryJSON={queryJSON}
                    columns={columnsToShow}
                    areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                    onLayout={onLayout}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    shouldAnimate={type === CONST.SEARCH.DATA_TYPES.EXPENSE}
                />
            </Animated.View>
        </SearchScopeProvider>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
