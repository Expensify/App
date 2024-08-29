import React, {useMemo, useRef} from 'react';
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
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const {clearSelectedTransactions} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    const MAX_BAR_OFFSET = 116;
    const HEADER_HEIGHT = 196;
    const scrollOffset = useRef(0);
    const topBarOffset = useSharedValue(0);
    const headerHeight = useSharedValue(HEADER_HEIGHT);
    const animatedTopBarStyle = useAnimatedStyle(() => ({
        transform: [{translateY: topBarOffset.value}],
        zIndex: -1,
    }));
    const animatedHeaderStyle = useAnimatedStyle(() => ({
        height: headerHeight.value,
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const isScrollingDown = currentOffset > scrollOffset.current;
        if (isScrollingDown && event.nativeEvent.contentOffset.y > 20) {
            const distanceScrolled = currentOffset - scrollOffset.current;
            // eslint-disable-next-line react-compiler/react-compiler
            topBarOffset.value = Math.max(-MAX_BAR_OFFSET, topBarOffset.value - distanceScrolled);
            headerHeight.value = Math.max(80, headerHeight.value - distanceScrolled);
        } else if (!isScrollingDown && event.nativeEvent.contentOffset.y + event.nativeEvent.layoutMeasurement.height < event.nativeEvent.contentSize.height - 10) {
            topBarOffset.value = withTiming(0, {duration: 300});
            headerHeight.value = withTiming(HEADER_HEIGHT, {duration: 300});
        }

        scrollOffset.current = currentOffset;
    };

    const {queryJSON, policyIDs, isCustomQuery} = useMemo(() => {
        if (!activeCentralPaneRoute || activeCentralPaneRoute.name !== SCREENS.SEARCH.CENTRAL_PANE) {
            return {queryJSON: undefined, policyIDs: undefined};
        }

        // This will be SEARCH_CENTRAL_PANE as we checked that in if.
        const searchParams = activeCentralPaneRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];

        return {
            queryJSON: SearchUtils.buildSearchQueryJSON(searchParams.q, searchParams.policyIDs),
            policyIDs: searchParams.policyIDs,
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
                                activeWorkspaceID={policyIDs}
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
                        policyIDs={policyIDs}
                        onSearchListScroll={handleScroll}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
