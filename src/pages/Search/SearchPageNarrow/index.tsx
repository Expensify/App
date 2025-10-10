import React, {useCallback, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import Navigation from '@navigation/Navigation';
import SearchPageNarrowContent from '@pages/Search/SearchPageNarrowContent';
import {turnOffMobileSelectionMode} from '@userActions/MobileSelectionMode';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SearchPageNarrowProps from './types';

function SearchPageNarrow({
    queryJSON,
    headerButtonsOptions,
    searchResults,
    isMobileSelectionModeEnabled,
    metadata,
    footerData,
    currentSelectedPolicyID,
    currentSelectedReportID,
    latestBankItems,
    confirmPayment,
}: SearchPageNarrowProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {clearSelectedTransactions} = useSearchContext();
    const [searchRouterListVisible, setSearchRouterListVisible] = useState(false);
    const {isOffline} = useNetwork();
    const currentSearchResultsKey = queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchResultsKey}`, {canBeMissing: true});

    const topBarOffset = useSharedValue<number>(StyleUtils.searchHeaderDefaultOffset);

    const handleBackButtonPress = useCallback(() => {
        if (!isMobileSelectionModeEnabled) {
            return false;
        }
        topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
        clearSelectedTransactions();
        turnOffMobileSelectionMode();
        return true;
    }, [isMobileSelectionModeEnabled, clearSelectedTransactions, topBarOffset, StyleUtils.searchHeaderDefaultOffset]);

    useHandleBackButton(handleBackButtonPress);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    const shouldDisplayCancelSearch = shouldUseNarrowLayout && searchRouterListVisible;
    const cancelSearchCallback = useCallback(() => {
        setSearchRouterListVisible(false);
    }, []);

    if (!queryJSON) {
        return (
            <ScreenWrapper
                testID={SearchPageNarrow.displayName}
                style={styles.pv0}
                offlineIndicatorStyle={styles.mtAuto}
                shouldShowOfflineIndicator={!!searchResults}
            >
                <FullPageNotFoundView
                    shouldShow={!queryJSON}
                    onBackButtonPress={handleOnBackButtonPress}
                    shouldShowLink={false}
                />
            </ScreenWrapper>
        );
    }

    const shouldShowFooter = !!metadata?.count;
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);
    const shouldShowLoadingState = !isOffline && (!isDataLoaded || !!currentSearchResults?.search?.isLoading);

    return (
        <ScreenWrapper
            testID={SearchPageNarrow.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            bottomContent={<NavigationTabBar selectedTab={NAVIGATION_TABS.SEARCH} />}
            headerGapStyles={styles.searchHeaderGap}
            shouldShowOfflineIndicator={!!searchResults}
        >
            <SearchPageNarrowContent
                queryJSON={queryJSON}
                headerButtonsOptions={headerButtonsOptions}
                searchResults={searchResults}
                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                footerData={footerData}
                searchRouterListVisible={searchRouterListVisible}
                setSearchRouterListVisible={setSearchRouterListVisible}
                handleSearchAction={handleOnBackButtonPress}
                clearSelectedTransactions={clearSelectedTransactions}
                shouldShowFooter={shouldShowFooter}
                shouldShowLoadingState={shouldShowLoadingState}
                shouldDisplayCancelSearch={shouldDisplayCancelSearch}
                cancelSearchCallback={cancelSearchCallback}
                currentSelectedPolicyID={currentSelectedPolicyID}
                currentSelectedReportID={currentSelectedReportID}
                latestBankItems={latestBankItems}
                confirmPayment={confirmPayment}
            />
        </ScreenWrapper>
    );
}

SearchPageNarrow.displayName = 'SearchPageNarrow';

export default SearchPageNarrow;
