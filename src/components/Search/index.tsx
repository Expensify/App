import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import SearchTableHeader from '@components/SelectionListWithSections/SearchTableHeader';
import type {ReportActionListItemType, SearchListItem, SelectionListHandle, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {openOldDotLink} from '@libs/actions/Link';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {openSearch, setOptimisticDataForTransactionThreadPreview} from '@libs/actions/Search';
import Timing from '@libs/actions/Timing';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import Performance from '@libs/Performance';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, isOneTransactionReport, selectFilteredReportActions} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {
    createAndOpenSearchTransactionThread,
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
    isTransactionCategoryGroupListItemType,
    isTransactionGroupListItemType,
    isTransactionListItemType,
    isTransactionMemberGroupListItemType,
    isTransactionMerchantGroupListItemType,
    isTransactionMonthGroupListItemType,
    isTransactionTagGroupListItemType,
    isTransactionWeekGroupListItemType,
    isTransactionWithdrawalIDGroupListItemType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isOnHold, isTransactionPendingDelete} from '@libs/TransactionUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import {isActionLoadingSetSelector} from '@src/selectors/ReportMetaData';
import type {OutstandingReportsByPolicyIDDerivedValue, Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import {useSearchContext} from './SearchContext';
import SearchList from './SearchList';
import {SearchScopeProvider} from './SearchScopeProvider';
import type {SearchColumnType, SearchParams, SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    searchResults?: SearchResults;
    handleSearch: (value: SearchParams) => void;
    onSortPressedCallback?: () => void;
    isMobileSelectionModeEnabled: boolean;
    searchRequestResponseStatusCode?: number | null;
    onDEWModalOpen?: () => void;
};

function mapTransactionItemToSelectedEntry(
    item: TransactionListItemType,
    itemTransaction: OnyxEntry<Transaction>,
    originalItemTransaction: OnyxEntry<Transaction>,
    currentUserLogin: string,
    currentUserAccountID: number,
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy);
    const canRejectRequest = item.report ? canRejectReportAction(currentUserLogin, item.report, item.policy) : false;
    return [
        item.keyForList,
        {
            transaction: item,
            isSelected: true,
            canReject: canRejectRequest,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canSplit: isSplitAction(item.report, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest(
                item.reportAction,
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
                item,
                item.report,
                item.policy,
            ),
            action: item.action,
            groupCurrency: item.groupCurrency,
            groupExchangeRate: item.groupExchangeRate,
            reportID: item.reportID,
            policyID: item.report?.policyID,
            amount: hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : item.amount,
            groupAmount: item.groupAmount,
            currency: item.currency,
            isFromOneTransactionReport: isOneTransactionReport(item.report),
            ownerAccountID: item.reportAction?.actorAccountID,
            reportAction: item.reportAction,
        },
    ];
}

function prepareTransactionsList(
    item: TransactionListItemType,
    itemTransaction: OnyxEntry<Transaction>,
    originalItemTransaction: OnyxEntry<Transaction>,
    selectedTransactions: SelectedTransactions,
    currentUserLogin: string,
    currentUserAccountID: number,
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy);
    const canRejectRequest = item.report ? canRejectReportAction(currentUserLogin, item.report, item.policy) : false;

    return {
        ...selectedTransactions,
        [item.keyForList]: {
            transaction: item,
            isSelected: true,
            canReject: canRejectRequest,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canSplit: isSplitAction(item.report, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest(
                item.reportAction,
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
                item,
                item.report,
                item.policy,
            ),
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: Math.abs(hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : item.amount),
            groupAmount: item.groupAmount,
            groupCurrency: item.groupCurrency,
            groupExchangeRate: item.groupExchangeRate,
            currency: item.currency,
            isFromOneTransactionReport: isOneTransactionReport(item.report),
            ownerAccountID: item.reportAction?.actorAccountID,
            reportAction: item.reportAction,
        },
    };
}

function Search({
    queryJSON,
    searchResults,
    onSearchListScroll,
    contentContainerStyle,
    handleSearch,
    isMobileSelectionModeEnabled,
    onSortPressedCallback,
    searchRequestResponseStatusCode,
    onDEWModalOpen,
}: SearchProps) {
    const {type, status, sortBy, sortOrder, hash, similarSearchHash, groupBy} = queryJSON;

    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {markReportIDAsExpense} = useContext(WideRHPContext);
    const {
        currentSearchHash,
        setCurrentSearchHashAndKey,
        setCurrentSearchQueryJSON,
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
        shouldUseLiveData,
    } = useSearchContext();
    const [offset, setOffset] = useState(0);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const [isActionLoadingSet = new Set<string>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}`, {canBeMissing: true, selector: isActionLoadingSetSelector});
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true, selector: columnsSelector});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});

    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const {markReportIDAsMultiTransactionExpense, unmarkReportIDAsMultiTransactionExpense} = useContext(WideRHPContext);

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        canBeMissing: true,
        selector: selectFilteredReportActions,
    });

    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    const {defaultCardFeed} = useCardFeedsForDisplay();
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID, defaultCardFeed?.id), [defaultCardFeed?.id, accountID]);
    const searchKey = useMemo(() => Object.values(suggestedSearches).find((search) => search.similarSearchHash === similarSearchHash)?.key, [suggestedSearches, similarSearchHash]);
    const searchDataType = useMemo(() => (shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type), [shouldUseLiveData, searchResults?.search?.type]);
    const shouldCalculateTotals = useSearchShouldCalculateTotals(searchKey, similarSearchHash, offset === 0);

    const previousReportActions = usePrevious(reportActions);
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const searchListRef = useRef<SelectionListHandle | null>(null);

    const handleDEWModalOpen = useCallback(() => {
        if (onDEWModalOpen) {
            onDEWModalOpen();
        } else {
            showConfirmModal({
                title: translate('customApprovalWorkflow.title'),
                prompt: translate('customApprovalWorkflow.description'),
                confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
                shouldShowCancelButton: false,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                openOldDotLink(CONST.OLDDOT_URLS.INBOX);
            });
        }
    }, [onDEWModalOpen, showConfirmModal, translate]);

    const clearTransactionsAndSetHashAndKey = useCallback(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHashAndKey(hash, searchKey);
        setCurrentSearchQueryJSON(queryJSON);
    }, [hash, searchKey, clearSelectedTransactions, setCurrentSearchHashAndKey, setCurrentSearchQueryJSON, queryJSON]);

    useFocusEffect(clearTransactionsAndSetHashAndKey);

    useEffect(() => {
        clearTransactionsAndSetHashAndKey();

        // Trigger once on mount (e.g., on page reload), when RHP is open and screen is not focused
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validGroupBy = groupBy && Object.values(CONST.SEARCH.GROUP_BY).includes(groupBy) ? groupBy : undefined;
    const prevValidGroupBy = usePrevious(validGroupBy);
    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults, validGroupBy);

    useEffect(() => {
        if (prevValidGroupBy === validGroupBy) {
            return;
        }
        clearSelectedTransactions();
    }, [validGroupBy, prevValidGroupBy, clearSelectedTransactions]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (selectedKeys.length === 0 && isMobileSelectionModeEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }

        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
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

        // We only want this effect to handle the switching of mobile selection mode state when screen size changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth]);

    useEffect(() => {
        openSearch({includePartiallySetupBankAccounts: true});
    }, []);

    useEffect(() => {
        if (!prevIsOffline || isOffline) {
            return;
        }
        openSearch({includePartiallySetupBankAccounts: true});
    }, [isOffline, prevIsOffline]);

    const {newSearchResultKeys, handleSelectionListScroll, newTransactions} = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
        shouldUseLiveData,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    // For to-do searches, we never show loading state since the data is always available locally from Onyx
    const shouldShowLoadingState =
        !shouldUseLiveData &&
        !isOffline &&
        (!isDataLoaded || (!!searchResults?.search.isLoading && Array.isArray(searchResults?.data) && searchResults?.data.length === 0) || (hasErrors && !searchRequestResponseStatusCode));
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const [baseFilteredData, filteredDataLength, allDataLength] = useMemo(() => {
        if (searchResults === undefined || !isDataLoaded) {
            return [[], 0, 0];
        }

        // Group-by option cannot be used for chats or tasks
        const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
        const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
        if (validGroupBy && (isChat || isTask)) {
            return [[], 0, 0];
        }

        const [filteredData1, allLength] = getSections({
            type,
            data: searchResults.data,
            policies,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList,
            groupBy: validGroupBy,
            reportActions: exportReportActions,
            currentSearch: searchKey,
            archivedReportsIDList: archivedReportsIdSet,
            queryJSON,
            isActionLoadingSet,
            cardFeeds,
            allTransactionViolations: violations,
        });
        return [filteredData1, filteredData1.length, allLength];
    }, [
        searchKey,
        exportReportActions,
        validGroupBy,
        isDataLoaded,
        searchResults,
        type,
        archivedReportsIdSet,
        translate,
        formatPhoneNumber,
        accountID,
        queryJSON,
        email,
        isActionLoadingSet,
        cardFeeds,
        policies,
        bankAccountList,
        violations,
    ]);

    // For group-by views, each grouped item has a transactionsQueryJSON with a hash pointing to a separate snapshot
    // containing its individual transactions. We collect these hashes and fetch their snapshots to enrich the grouped items.
    const groupByTransactionHashes = useMemo(() => {
        if (!validGroupBy) {
            return [];
        }
        return (baseFilteredData as TransactionGroupListItemType[])
            .map((item) => (item.transactionsQueryJSON?.hash ? String(item.transactionsQueryJSON.hash) : undefined))
            .filter((hashValue): hashValue is string => !!hashValue);
    }, [validGroupBy, baseFilteredData]);

    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData = useMemo(() => {
        if (!validGroupBy || isExpenseReportType) {
            return baseFilteredData;
        }

        const enriched = (baseFilteredData as TransactionGroupListItemType[]).map((item) => {
            const snapshot = item.transactionsQueryJSON?.hash ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
            if (!snapshot?.data) {
                return item;
            }

            const [transactions1] = getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: snapshot.data,
                currentAccountID: accountID,
                currentUserEmail: email ?? '',
                bankAccountList,
                translate,
                formatPhoneNumber,
                isActionLoadingSet,
            });
            return {...item, transactions: transactions1 as TransactionListItemType[]};
        });

        return enriched;
    }, [validGroupBy, isExpenseReportType, baseFilteredData, groupByTransactionSnapshots, accountID, email, translate, formatPhoneNumber, isActionLoadingSet, bankAccountList]);

    const hasLoadedAllTransactions = useMemo(() => {
        if (!validGroupBy) {
            return true;
        }
        // For group-by views, check if all transactions in groups have been loaded
        return (baseFilteredData as TransactionGroupListItemType[]).every((item) => {
            const snapshot = item.transactionsQueryJSON?.hash || item.transactionsQueryJSON?.hash === 0 ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
            // If snapshot doesn't exist, the group hasn't been expanded yet (transactions not loaded)
            // If snapshot exists and has hasMoreResults: true, not all transactions are loaded
            return !!snapshot && !snapshot?.search?.hasMoreResults;
        });
    }, [validGroupBy, baseFilteredData, groupByTransactionSnapshots]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowFiltersBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowFiltersBarLoading, shouldShowLoadingState, type]);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        const isMigratedModalDisplayed = focusedRoute?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR || focusedRoute?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;

        const comingBackOnlineWithNoResults = prevIsOffline && !isOffline && isEmptyObject(searchResults?.data);
        if (!comingBackOnlineWithNoResults && ((!isFocused && !isMigratedModalDisplayed) || isOffline)) {
            return;
        }

        handleSearch({queryJSON, searchKey, offset, shouldCalculateTotals, prevReportsLength: filteredDataLength, isLoading: !!searchResults?.search?.isLoading});

        // We don't need to run the effect on change of isFocused.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSearch, isOffline, offset, queryJSON, searchKey, shouldCalculateTotals]);

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
        if (validGroupBy || isExpenseReportType) {
            for (const transactionGroup of filteredData) {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    continue;
                }

                // For expense reports: when ANY transaction is selected, we want ALL transactions in the report selected.
                // This ensures report-level selection persists when new transactions are added.
                const hasAnySelected = isExpenseReportType && transactionGroup.transactions.some((transaction: TransactionListItemType) => transaction.transactionID in selectedTransactions);

                for (const transactionItem of transactionGroup.transactions) {
                    const isSelected = transactionItem.transactionID in selectedTransactions;

                    // Include transaction if: already individually selected, part of select-all, or (for expense reports) part of a partially-selected report
                    const shouldInclude = isSelected || areAllMatchingItemsSelected || (isExpenseReportType && hasAnySelected);
                    if (!shouldInclude) {
                        continue;
                    }

                    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                        transactionItem.report,
                        transactionItem.reportAction,
                        transactionItem.holdReportAction,
                        transactionItem,
                        transactionItem.policy,
                    );
                    const canRejectRequest = email && transactionItem.report ? canRejectReportAction(email, transactionItem.report, transactionItem.policy) : false;

                    const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                    const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];

                    newTransactionList[transactionItem.transactionID] = {
                        transaction: transactionItem,
                        action: transactionItem.action,
                        canHold: canHoldRequest,
                        isHeld: isOnHold(transactionItem),
                        canUnhold: canUnholdRequest,
                        canSplit: isSplitAction(transactionItem.report, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy),
                        hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                        canChangeReport: canEditFieldOfMoneyRequest(
                            transactionItem.reportAction,
                            CONST.EDIT_REQUEST_FIELD.REPORT,
                            undefined,
                            undefined,
                            outstandingReportsByPolicyID,
                            transactionItem,
                            transactionItem.report,
                            transactionItem.policy,
                        ),
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID]?.isSelected || isExpenseReportType,
                        canReject: canRejectRequest,
                        reportID: transactionItem.reportID,
                        policyID: transactionItem.report?.policyID,
                        amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                        groupAmount: transactionItem.groupAmount,
                        groupCurrency: transactionItem.groupCurrency,
                        groupExchangeRate: transactionItem.groupExchangeRate,
                        currency: transactionItem.currency,
                        ownerAccountID: transactionItem.reportAction?.actorAccountID,
                        reportAction: transactionItem.reportAction,
                        isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                    };
                }
            }
        } else {
            for (const transactionItem of filteredData) {
                if (!Object.hasOwn(transactionItem, 'transactionID') || !('transactionID' in transactionItem)) {
                    continue;
                }
                if (!(transactionItem.transactionID in selectedTransactions) && !areAllMatchingItemsSelected) {
                    continue;
                }

                const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                    transactionItem.report,
                    transactionItem.reportAction,
                    transactionItem.holdReportAction,
                    transactionItem,
                    transactionItem.policy,
                );
                const canRejectRequest = email && transactionItem.report ? canRejectReportAction(email, transactionItem.report, transactionItem.policy) : false;

                const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];

                newTransactionList[transactionItem.transactionID] = {
                    transaction: transactionItem,
                    action: transactionItem.action,
                    canHold: canHoldRequest,
                    isHeld: isOnHold(transactionItem),
                    canUnhold: canUnholdRequest,
                    canSplit: isSplitAction(transactionItem.report, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy),
                    hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                    canChangeReport: canEditFieldOfMoneyRequest(
                        transactionItem.reportAction,
                        CONST.EDIT_REQUEST_FIELD.REPORT,
                        undefined,
                        undefined,
                        outstandingReportsByPolicyID,
                        transactionItem,
                        transactionItem.report,
                        transactionItem.policy,
                    ),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID].isSelected,
                    canReject: canRejectRequest,
                    reportID: transactionItem.reportID,
                    policyID: transactionItem.report?.policyID,
                    amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                    groupAmount: transactionItem.groupAmount,
                    groupCurrency: transactionItem.groupCurrency,
                    groupExchangeRate: transactionItem.groupExchangeRate,
                    currency: transactionItem.currency,
                    ownerAccountID: transactionItem.reportAction?.actorAccountID,
                    reportAction: transactionItem.reportAction,
                    isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                };
            }
        }
        if (isEmptyObject(newTransactionList) && Object.keys(selectedTransactions).length === 0) {
            return;
        }

        setSelectedTransactions(newTransactionList, filteredData);

        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, setSelectedTransactions, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType]);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    const isUnmounted = useRef(false);

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    useEffect(
        () => () => {
            if (!isFocused && !isUnmounted.current) {
                return;
            }
            if (isSearchTopmostFullScreenRoute() && currentSearchHash === hash) {
                return;
            }
            clearSelectedTransactions();
            turnOffMobileSelectionMode();
        },
        [isFocused, clearSelectedTransactions, hash, currentSearchHash],
    );

    // When selectedTransactions is updated, we confirm that selection is refreshed
    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!filteredData.length || isRefreshingSelection.current) {
            return;
        }
        const areItemsGrouped = !!validGroupBy || type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
        const flattenedItems = areItemsGrouped ? (filteredData as TransactionGroupListItemType[]).flatMap((item) => item.transactions) : filteredData;
        const areAllItemsSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        // If the user has selected all the expenses in their view but there are more expenses matched by the search
        // give them the option to select all matching expenses
        shouldShowSelectAllMatchingItems(!!(areAllItemsSelected && searchResults?.search?.hasMoreResults));
        if (!areAllItemsSelected) {
            selectAllMatchingItems(false);
        }
    }, [isFocused, filteredData, searchResults?.search?.hasMoreResults, selectedTransactions, selectAllMatchingItems, shouldShowSelectAllMatchingItems, validGroupBy, type]);

    const toggleTransaction = useCallback(
        (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
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
                const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                setSelectedTransactions(
                    prepareTransactionsList(item, itemTransaction, originalItemTransaction, selectedTransactions, email ?? '', accountID, outstandingReportsByPolicyID),
                    filteredData,
                );
                return;
            }

            const currentTransactions = itemTransactions ?? item.transactions;
            if (currentTransactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

                for (const transaction of currentTransactions) {
                    delete reducedSelectedTransactions[transaction.keyForList];
                }

                setSelectedTransactions(reducedSelectedTransactions, filteredData);
                return;
            }

            setSelectedTransactions(
                {
                    ...selectedTransactions,
                    ...Object.fromEntries(
                        currentTransactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => {
                                const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                                const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                                return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                            }),
                    ),
                },
                filteredData,
            );
        },
        [setSelectedTransactions, selectedTransactions, filteredData, transactions, outstandingReportsByPolicyID, searchResults?.data, email, accountID],
    );

    const onSelectRow = useCallback(
        (item: SearchListItem, transactionPreviewData?: TransactionPreviewData) => {
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(item);
                return;
            }

            const isTransactionItem = isTransactionListItemType(item);
            const backTo = Navigation.getActiveRoute();
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && !item?.reportAction?.childReportID) {
                // If the report is unreported (self DM), we want to open the track expense thread instead of a report with an ID of 0
                const shouldOpenTransactionThread = !isOneTransactionReport(item.report) || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                createAndOpenSearchTransactionThread(item, backTo, item?.reportAction?.childReportID, undefined, shouldOpenTransactionThread);
                if (shouldOpenTransactionThread) {
                    return;
                }
            }

            if (isTransactionMemberGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.accountID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionCardGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.cardID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionWithdrawalIDGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.entryID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionCategoryGroupListItemType(item)) {
                const categoryValue = item.category === '' ? CONST.SEARCH.CATEGORY_EMPTY_VALUE : item.category;
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: categoryValue}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionMerchantGroupListItemType(item)) {
                const merchantValue = item.merchant === '' ? CONST.SEARCH.MERCHANT_EMPTY_VALUE : item.merchant;
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: merchantValue}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionTagGroupListItemType(item)) {
                const tagValue = item.tag === '' || item.tag === '(untagged)' ? CONST.SEARCH.TAG_EMPTY_VALUE : item.tag;
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: tagValue}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionMonthGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
                const {start: monthStart, end: monthEnd} = DateUtils.getMonthDateRange(item.year, item.month);
                newFlatFilters.push({
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, value: monthStart},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: monthEnd},
                    ],
                });
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            if (isTransactionWeekGroupListItemType(item)) {
                const weekGroupItem = item;
                if (!weekGroupItem.week) {
                    return;
                }
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
                const {start: weekStart, end: weekEnd} = DateUtils.getWeekDateRange(weekGroupItem.week);
                newFlatFilters.push({
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, value: weekStart},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: weekEnd},
                    ],
                });
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
                return;
            }

            // After handling all group types, item should be TransactionListItemType or ReportActionListItemType
            if (!isTransactionItem && !isReportActionListItemType(item)) {
                return;
            }

            const transactionItem = item as TransactionListItemType;
            const reportActionItem = item as ReportActionListItemType;

            let reportID = transactionItem.reportID ?? reportActionItem.reportID;
            if (isTransactionItem && transactionItem?.reportAction?.childReportID) {
                const isFromSelfDM = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                const isFromOneTransactionReport = isOneTransactionReport(transactionItem.report);

                if (isFromSelfDM || !isFromOneTransactionReport) {
                    reportID = transactionItem?.reportAction?.childReportID;
                }
            }

            if (!reportID) {
                return;
            }

            Performance.markStart(CONST.TIMING.OPEN_REPORT_SEARCH);
            Timing.start(CONST.TIMING.OPEN_REPORT_SEARCH);
            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
                name: 'Search',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            if (isTransactionGroupListItemType(item)) {
                const groupItem = item as TransactionGroupListItemType;
                const firstTransaction = groupItem.transactions.at(0);
                if (groupItem.isOneTransactionReport && firstTransaction && transactionPreviewData) {
                    if (!firstTransaction?.reportAction?.childReportID) {
                        createAndOpenSearchTransactionThread(firstTransaction, backTo, firstTransaction?.reportAction?.childReportID, transactionPreviewData, false);
                    } else {
                        setOptimisticDataForTransactionThreadPreview(firstTransaction, transactionPreviewData, firstTransaction?.reportAction?.childReportID);
                    }
                }

                if (groupItem.transactions.length > 1) {
                    markReportIDAsMultiTransactionExpense(reportID);
                } else {
                    unmarkReportIDAsMultiTransactionExpense(reportID);
                }

                requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo})));
                return;
            }

            if (isReportActionListItemType(item)) {
                const reportActionID = reportActionItem.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            markReportIDAsExpense(reportID);

            if (isTransactionItem && transactionPreviewData) {
                setOptimisticDataForTransactionThreadPreview(transactionItem, transactionPreviewData, transactionItem?.reportAction?.childReportID);
            }

            requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
        },
        [
            isMobileSelectionModeEnabled,
            markReportIDAsExpense,
            toggleTransaction,
            queryJSON,
            handleSearch,
            searchKey,
            markReportIDAsMultiTransactionExpense,
            unmarkReportIDAsMultiTransactionExpense,
        ],
    );

    const currentColumns = useMemo(() => {
        if (!searchResults?.data) {
            return [];
        }
        return getColumnsToShow(accountID, searchResults?.data, visibleColumns, false, searchDataType, validGroupBy);
    }, [accountID, searchResults?.data, searchDataType, visibleColumns, validGroupBy]);

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
    const canSelectMultiple = !isChat && !isTask && (!isSmallScreenWidth || isMobileSelectionModeEnabled);
    const ListItem = getListItem(type, status, validGroupBy);

    const sortedData = useMemo(
        () =>
            getSortedSections(type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy).map((item) => {
                const baseKey = isChat
                    ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(item as ReportActionListItemType).reportActionID}`
                    : `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;

                const isBaseKeyMatch = !!newSearchResultKeys?.has(baseKey);

                const isAnyTransactionMatch =
                    !isChat &&
                    (item as TransactionGroupListItemType)?.transactions?.some((transaction) => {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                        return !!newSearchResultKeys?.has(transactionKey);
                    });

                const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

                if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
                    return item;
                }

                return {...item, shouldAnimateInHighlight, hash};
            }),
        [type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy, isChat, newSearchResultKeys, hash],
    );

    useEffect(() => {
        const currentRoute = Navigation.getActiveRouteWithoutParams();
        if (hasErrors && (currentRoute === '/' || (shouldResetSearchQuery && currentRoute === '/search'))) {
            // Use requestAnimationFrame to safely update navigation params without overriding the current route
            requestAnimationFrame(() => {
                // We want to explicitly clear stale rawQuery since it’s only used for manually typed-in queries.
                Navigation.setParams({q: buildCannedSearchQuery(), rawQuery: undefined});
            });
            if (shouldResetSearchQuery) {
                setShouldResetSearchQuery(false);
            }
        }
    }, [hasErrors, queryJSON, searchResults, shouldResetSearchQuery, setShouldResetSearchQuery]);

    const fetchMoreResults = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!isFocused || !searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems || offset > allDataLength - CONST.SEARCH.RESULTS_PAGE_SIZE) {
            return;
        }

        setOffset((prev) => prev + CONST.SEARCH.RESULTS_PAGE_SIZE);
    }, [isFocused, searchResults?.search?.hasMoreResults, shouldShowLoadingMoreItems, shouldShowLoadingState, offset, allDataLength]);

    const toggleAllTransactions = useCallback(() => {
        const areItemsGrouped = !!validGroupBy || isExpenseReportType;
        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            return;
        }

        if (areItemsGrouped) {
            setSelectedTransactions(
                Object.fromEntries(
                    (filteredData as TransactionGroupListItemType[]).flatMap((item) =>
                        item.transactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => {
                                const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                                const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                                return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                            }),
                    ),
                ),
                filteredData,
            );

            return;
        }

        setSelectedTransactions(
            Object.fromEntries(
                (filteredData as TransactionListItemType[])
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                        const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                    }),
            ),
            filteredData,
        );
    }, [
        validGroupBy,
        isExpenseReportType,
        filteredData,
        selectedTransactions,
        setSelectedTransactions,
        clearSelectedTransactions,
        transactions,
        outstandingReportsByPolicyID,
        searchResults?.data,
        email,
        accountID,
    ]);

    const onLayout = useCallback(() => {
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB_RENDER);
        handleSelectionListScroll(sortedData, searchListRef.current);
    }, [handleSelectionListScroll, sortedData]);

    useEffect(() => {
        if (shouldShowLoadingState) {
            return;
        }

        const renderSpanParent = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);

        if (renderSpanParent) {
            startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB_RENDER, {
                name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB_RENDER,
                op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB_RENDER,
                parentSpan: renderSpanParent,
            }).setAttributes({
                inputQuery: queryJSON?.inputQuery,
            });
        }

        // Exclude `queryJSON?.inputQuery` since it’s only telemetry metadata and would cause the span to start multiple times.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowLoadingState]);

    const onLayoutSkeleton = useCallback(() => {
        endSpan(CONST.TELEMETRY.SPAN_ON_LAYOUT_SKELETON_REPORTS);
    }, []);

    if (shouldShowLoadingState) {
        return (
            <Animated.View
                entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                style={[styles.flex1]}
                onLayout={onLayoutSkeleton}
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
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    if (hasErrors) {
        const isInvalidQuery = searchRequestResponseStatusCode === CONST.JSON_CODE.INVALID_SEARCH_QUERY;
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <FullPageErrorView
                    shouldShow
                    subtitleStyle={styles.textSupporting}
                    title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
                    subtitle={translate(isInvalidQuery ? 'errorPage.wrongTypeSubtitle' : 'errorPage.subtitle')}
                />
            </View>
        );
    }

    const visibleDataLength = filteredData.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length;
    if (shouldShowEmptyState(isDataLoaded, visibleDataLength, searchDataType)) {
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView
                    similarSearchHash={similarSearchHash}
                    type={type}
                    hasResults={searchResults?.search?.hasResults}
                    queryJSON={queryJSON}
                />
            </View>
        );
    }

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        clearSelectedTransactions();
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
        onSortPressedCallback?.();
        // We want to explicitly clear stale rawQuery since it's only used for manually typed-in queries.
        navigation.setParams({q: newQuery, rawQuery: undefined});
    };

    const {shouldShowYearCreated, shouldShowYearSubmitted, shouldShowYearApproved, shouldShowYearPosted, shouldShowYearExported} = shouldShowYearUtil(
        searchResults?.data,
        isExpenseReportType ?? false,
    );
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(searchResults?.data);
    const shouldShowTableHeader = isLargeScreenWidth && !isChat;
    const tableHeaderVisible = canSelectMultiple || shouldShowTableHeader;

    return (
        <SearchScopeProvider>
            <Animated.View style={[styles.flex1, animatedStyle]}>
                <SearchList
                    ref={searchListRef}
                    data={sortedData}
                    ListItem={ListItem}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={toggleTransaction}
                    onAllCheckboxPress={toggleAllTransactions}
                    canSelectMultiple={canSelectMultiple}
                    selectedTransactions={selectedTransactions}
                    shouldPreventLongPressRow={isChat || isTask}
                    onDEWModalOpen={handleDEWModalOpen}
                    isDEWBetaEnabled={isDEWBetaEnabled}
                    SearchTableHeader={
                        !shouldShowTableHeader ? undefined : (
                            <View style={[!isTask && styles.pr8, styles.flex1]}>
                                <SearchTableHeader
                                    canSelectMultiple={canSelectMultiple}
                                    columns={columnsToShow}
                                    type={type}
                                    onSortPress={onSortPress}
                                    sortOrder={sortOrder}
                                    sortBy={sortBy}
                                    shouldShowYear={shouldShowYearCreated}
                                    shouldShowYearSubmitted={shouldShowYearSubmitted}
                                    shouldShowYearApproved={shouldShowYearApproved}
                                    shouldShowYearPosted={shouldShowYearPosted}
                                    shouldShowYearExported={shouldShowYearExported}
                                    isAmountColumnWide={shouldShowAmountInWideColumn}
                                    isTaxAmountColumnWide={shouldShowTaxAmountInWideColumn}
                                    shouldShowSorting
                                    groupBy={validGroupBy}
                                />
                            </View>
                        )
                    }
                    contentContainerStyle={[styles.pb3, contentContainerStyle]}
                    containerStyle={[styles.pv0, !tableHeaderVisible && !isSmallScreenWidth && styles.pt3]}
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
                    violations={violations}
                    onLayout={onLayout}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    shouldAnimate={type === CONST.SEARCH.DATA_TYPES.EXPENSE}
                    newTransactions={newTransactions}
                    hasLoadedAllTransactions={hasLoadedAllTransactions}
                    customCardNames={customCardNames}
                />
            </Animated.View>
        </SearchScopeProvider>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
const WrappedSearch = Sentry.withProfiler(Search) as typeof Search;
WrappedSearch.displayName = 'Search';

export default WrappedSearch;
