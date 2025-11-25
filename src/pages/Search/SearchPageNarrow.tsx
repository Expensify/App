import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {FullScreenBlockingViewContext} from '@components/FullScreenBlockingViewContextProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {PaymentMethodType} from '@components/KYCWall/types';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem, SearchParams, SearchQueryJSON} from '@components/Search/types';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import {searchInServer} from '@userActions/Report';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    metadata?: SearchResultsInfo;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    searchResults?: SearchResults;
    isMobileSelectionModeEnabled: boolean;
    footerData: {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

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
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {clearSelectedTransactions, selectedTransactions} = useSearchContext();
    const [searchRouterListVisible, setSearchRouterListVisible] = useState(false);
    const {isOffline} = useNetwork();
    const currentSearchResultsKey = queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchResultsKey}`, {canBeMissing: true});
    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();
    const route = useRoute();
    const {saveScrollOffset} = useContext(ScrollOffsetContext);

    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);

    const scrollOffset = useSharedValue(0);
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

    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler(
        {
            onScroll: (event) => {
                scheduleOnRN(triggerScrollEvent);
                const {contentOffset, layoutMeasurement, contentSize} = event;
                if (windowHeight > contentSize.height) {
                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                    return;
                }
                const currentOffset = contentOffset.y;
                const isScrollingDown = currentOffset > scrollOffset.get();
                const distanceScrolled = currentOffset - scrollOffset.get();

                scheduleOnRN(saveScrollOffset, route, currentOffset);

                if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                    topBarOffset.set(clamp(topBarOffset.get() - distanceScrolled, variables.minimalTopBarOffset, StyleUtils.searchHeaderDefaultOffset));
                } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                    topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
                }
                scrollOffset.set(currentOffset);
            },
        },
        [],
    );

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    const shouldDisplayCancelSearch = shouldUseNarrowLayout && searchRouterListVisible;
    const cancelSearchCallback = useCallback(() => {
        setSearchRouterListVisible(false);
    }, []);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value).then((jsonCode) => setSearchRequestResponseStatusCode(Number(jsonCode ?? 0)));
        }
    }, []);

    const {addRouteKey, removeRouteKey} = useContext(FullScreenBlockingViewContext);
    useEffect(() => {
        if (!searchRouterListVisible) {
            return;
        }

        addRouteKey(route.key);

        return () => removeRouteKey(route.key);
    }, [addRouteKey, removeRouteKey, route.key, searchRouterListVisible]);

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

    const shouldShowFooter = !!metadata?.count || Object.keys(selectedTransactions).length > 0;
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);
    const shouldShowLoadingState = !isOffline && (!isDataLoaded || !!currentSearchResults?.search?.isLoading);

    return (
        <ScreenWrapper
            testID={SearchPageNarrow.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            bottomContent={!searchRouterListVisible && <NavigationTabBar selectedTab={NAVIGATION_TABS.SEARCH} />}
            headerGapStyles={styles.searchHeaderGap}
            shouldShowOfflineIndicator={!!searchResults}
        >
            <View style={[styles.flex1, styles.overflowHidden]}>
                {!isMobileSelectionModeEnabled ? (
                    <View style={[StyleUtils.getSearchPageNarrowHeaderStyles(), searchRouterListVisible && styles.flex1, styles.mh100]}>
                        <View style={[styles.zIndex10, styles.appBG]}>
                            <TopBar
                                shouldShowLoadingBar={shouldShowLoadingState}
                                breadcrumbLabel={translate('common.reports')}
                                shouldDisplaySearch={false}
                                cancelSearch={shouldDisplayCancelSearch ? cancelSearchCallback : undefined}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <Animated.View
                                style={[
                                    topBarAnimatedStyle,
                                    !searchRouterListVisible && styles.narrowSearchRouterInactiveStyle,
                                    styles.flex1,
                                    styles.bgTransparent,
                                    styles.searchTopBarZIndexStyle,
                                ]}
                            >
                                <View style={[styles.flex1, styles.pt2, styles.appBG]}>
                                    <SearchPageHeader
                                        queryJSON={queryJSON}
                                        searchRouterListVisible={searchRouterListVisible}
                                        hideSearchRouterList={() => {
                                            setSearchRouterListVisible(false);
                                        }}
                                        onSearchRouterFocus={() => {
                                            topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                            setSearchRouterListVisible(true);
                                        }}
                                        headerButtonsOptions={headerButtonsOptions}
                                        handleSearch={handleSearchAction}
                                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                    />
                                </View>
                                <View style={[styles.appBG]}>
                                    {!searchRouterListVisible && (
                                        <SearchFiltersBar
                                            queryJSON={queryJSON}
                                            headerButtonsOptions={headerButtonsOptions}
                                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                        />
                                    )}
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                ) : (
                    <>
                        <HeaderWithBackButton
                            title={translate('common.selectMultiple')}
                            onBackButtonPress={() => {
                                topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                clearSelectedTransactions();
                                turnOffMobileSelectionMode();
                            }}
                        />
                        <SearchPageHeader
                            queryJSON={queryJSON}
                            headerButtonsOptions={headerButtonsOptions}
                            handleSearch={handleSearchAction}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            currentSelectedPolicyID={currentSelectedPolicyID}
                            currentSelectedReportID={currentSelectedReportID}
                            latestBankItems={latestBankItems}
                            confirmPayment={confirmPayment}
                        />
                    </>
                )}
                {!searchRouterListVisible && (
                    <View style={[styles.flex1]}>
                        <Search
                            searchResults={searchResults}
                            key={queryJSON.hash}
                            queryJSON={queryJSON}
                            onSearchListScroll={scrollHandler}
                            contentContainerStyle={!isMobileSelectionModeEnabled ? styles.searchListContentContainerStyles : undefined}
                            handleSearch={handleSearchAction}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                        />
                    </View>
                )}
                {shouldShowFooter && !searchRouterListVisible && (
                    <SearchPageFooter
                        count={footerData.count}
                        total={footerData.total}
                        currency={footerData.currency}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

SearchPageNarrow.displayName = 'SearchPageNarrow';

export default SearchPageNarrow;
