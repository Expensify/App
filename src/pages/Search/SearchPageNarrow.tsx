import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchStatusBar from '@components/Search/SearchPageHeader/SearchStatusBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    policyID?: string;
    searchName?: string;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    currentSearchResults?: SearchResults;
    lastNonEmptySearchResults?: SearchResults;
};

function SearchPageNarrow({queryJSON, policyID, searchName, headerButtonsOptions, currentSearchResults, lastNonEmptySearchResults}: SearchPageNarrowProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const {clearSelectedTransactions} = useSearchContext();
    const [searchRouterListVisible, setSearchRouterListVisible] = useState(false);
    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;

    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();

    const handleBackButtonPress = useCallback(() => {
        if (!selectionMode?.isEnabled) {
            return false;
        }
        clearSelectedTransactions(undefined, true);
        return true;
    }, [selectionMode, clearSelectedTransactions]);

    useHandleBackButton(handleBackButtonPress);

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(StyleUtils.searchHeaderDefaultOffset);
    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            runOnJS(triggerScrollEvent)();
            const {contentOffset, layoutMeasurement, contentSize} = event;
            if (windowHeight > contentSize.height) {
                return;
            }
            const currentOffset = contentOffset.y;
            const isScrollingDown = currentOffset > scrollOffset.get();
            const distanceScrolled = currentOffset - scrollOffset.get();

            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                topBarOffset.set(clamp(topBarOffset.get() - distanceScrolled, variables.minimalTopBarOffset, StyleUtils.searchHeaderDefaultOffset));
            } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
            }
            scrollOffset.set(currentOffset);
        },
    });

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    const shouldDisplayCancelSearch = shouldUseNarrowLayout && ((!!queryJSON && !isCannedSearchQuery(queryJSON)) || searchRouterListVisible);
    const cancelSearchCallback = useCallback(() => {
        if (searchRouterListVisible) {
            setSearchRouterListVisible(false);
            return;
        }
        Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    }, [searchRouterListVisible]);

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

    return (
        <ScreenWrapper
            testID={SearchPageNarrow.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            bottomContent={!searchRouterListVisible && <BottomTabBar selectedTab={BOTTOM_TABS.SEARCH} />}
            headerGapStyles={styles.searchHeaderGap}
            shouldShowOfflineIndicator={!!searchResults}
        >
            <View style={[styles.flex1, styles.overflowHidden]}>
                {!selectionMode?.isEnabled ? (
                    <View style={[StyleUtils.getSearchBottomTabHeaderStyles(), searchRouterListVisible && styles.flex1, styles.mh100]}>
                        <View style={[styles.zIndex10, styles.appBG]}>
                            <TopBar
                                activeWorkspaceID={policyID}
                                breadcrumbLabel={translate('common.reports')}
                                shouldDisplaySearch={false}
                                cancelSearch={shouldDisplayCancelSearch ? cancelSearchCallback : undefined}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <Animated.View style={[topBarAnimatedStyle, !searchRouterListVisible && styles.narrowSearchRouterInactiveStyle, styles.flex1, styles.bgTransparent]}>
                                <View style={[styles.narrowSearchHeaderStyle, styles.flex1]}>
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
                                    />
                                </View>
                                <View style={[styles.appBG]}>
                                    {!searchRouterListVisible && (
                                        <SearchStatusBar
                                            queryJSON={queryJSON}
                                            onStatusChange={() => {
                                                topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
                                            }}
                                            headerButtonsOptions={headerButtonsOptions}
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
                            searchName={searchName}
                            headerButtonsOptions={headerButtonsOptions}
                        />
                    </>
                )}
                {!searchRouterListVisible && (
                    <View style={[styles.flex1]}>
                        <Search
                            currentSearchResults={currentSearchResults}
                            lastNonEmptySearchResults={lastNonEmptySearchResults}
                            key={queryJSON.hash}
                            queryJSON={queryJSON}
                            onSearchListScroll={scrollHandler}
                            contentContainerStyle={!selectionMode?.isEnabled ? styles.searchListContentContainerStyles : undefined}
                        />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

SearchPageNarrow.displayName = 'SearchPageNarrow';

export default SearchPageNarrow;
