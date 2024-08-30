import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchStatusBar from '@components/Search/SearchStatusBar';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const {clearSelectedTransactions} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue(0);
    const headerHeight = useSharedValue(CONST.SEARCH.SEARCH_HEADER_HEIGHT + CONST.SEARCH.TYPE_AND_STATUS_BAR_HEIGHT);
    const animatedTopBarStyle = useAnimatedStyle(() => ({
        transform: [{translateY: topBarOffset.value}],
        zIndex: -1,
    }));
    const animatedHeaderStyle = useAnimatedStyle(() => ({
        height: headerHeight.value,
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent;
        if (windowHeight + CONST.SEARCH.TYPE_AND_STATUS_BAR_HEIGHT > contentSize.height) {
            return;
        }

        const currentOffset = contentOffset.y;
        const isScrollingDown = currentOffset > scrollOffset.value;
        if (isScrollingDown && contentOffset.y > 20) {
            const distanceScrolled = currentOffset - scrollOffset.value;
            // eslint-disable-next-line react-compiler/react-compiler
            topBarOffset.value = Math.max(-CONST.SEARCH.TYPE_AND_STATUS_BAR_HEIGHT, topBarOffset.value - distanceScrolled);
            headerHeight.value = Math.max(CONST.SEARCH.SEARCH_HEADER_HEIGHT, headerHeight.value - distanceScrolled);
        } else if (!isScrollingDown && contentOffset.y + layoutMeasurement.height < contentSize.height - 10) {
            topBarOffset.value = withTiming(0, {duration: 300});
            headerHeight.value = withTiming(CONST.SEARCH.SEARCH_HEADER_HEIGHT + CONST.SEARCH.TYPE_AND_STATUS_BAR_HEIGHT, {duration: 300});
        }

        scrollOffset.value = currentOffset;
    };

    const {queryJSON, policyID, isCustomQuery} = useMemo(() => {
        if (activeCentralPaneRoute?.name !== SCREENS.SEARCH.CENTRAL_PANE) {
            return {queryJSON: undefined, policyID: undefined, isCustomQuery: undefined};
        }

        const searchParams = activeCentralPaneRoute?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
        const parsedQuery = SearchUtils.buildSearchQueryJSON(searchParams?.q);

        return {
            queryJSON: parsedQuery,
            policyID: parsedQuery && SearchUtils.getPolicyIDFromSearchQuery(parsedQuery),
            isCustomQuery: searchParams.isCustomQuery,
        };
    }, [activeCentralPaneRoute]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView
                shouldShow={!queryJSON}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                {!selectionMode?.isEnabled && queryJSON ? (
                    <Animated.View style={animatedHeaderStyle}>
                        <View style={styles.appBG}>
                            <TopBar
                                activeWorkspaceID={policyID}
                                breadcrumbLabel={translate('common.search')}
                                shouldDisplaySearch={false}
                            />
                        </View>
                        <Animated.View style={animatedTopBarStyle}>
                            <SearchTypeMenu
                                isCustomQuery={isCustomQuery}
                                queryJSON={queryJSON}
                            />
                            {shouldUseNarrowLayout && (
                                <SearchStatusBar
                                    type={queryJSON.type}
                                    status={queryJSON.status}
                                />
                            )}
                        </Animated.View>
                    </Animated.View>
                ) : (
                    <HeaderWithBackButton
                        title={translate('common.selectMultiple')}
                        onBackButtonPress={() => {
                            clearSelectedTransactions();
                            turnOffMobileSelectionMode();
                        }}
                    />
                )}
                {shouldUseNarrowLayout && queryJSON && (
                    <Search
                        queryJSON={queryJSON}
                        isCustomQuery={isCustomQuery}
                        onSearchListScroll={handleScroll}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
