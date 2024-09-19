import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import SearchStatusBar from '@components/Search/SearchStatusBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BottomTabBar from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/BottomTabBar';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchSelectionModeHeader from './SearchSelectionModeHeader';
import SearchTypeMenu from './SearchTypeMenu';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageBottomTabProps = {
    queryJSON?: SearchQueryJSON;
    policyID?: string;
    searchName?: string;
};

function SearchPageBottomTab({queryJSON, policyID, searchName}: SearchPageBottomTabProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();

    const styles = useThemeStyles();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(variables.searchHeaderHeight);
    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.value,
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const {contentOffset, layoutMeasurement, contentSize} = event;
            if (windowHeight > contentSize.height) {
                return;
            }
            const currentOffset = contentOffset.y;
            const isScrollingDown = currentOffset > scrollOffset.value;
            const distanceScrolled = currentOffset - scrollOffset.value;
            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                // eslint-disable-next-line react-compiler/react-compiler
                topBarOffset.value = clamp(topBarOffset.value - distanceScrolled, variables.minimalTopBarOffset, variables.searchHeaderHeight);
            } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.value = withTiming(variables.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS});
            }
            scrollOffset.value = currentOffset;
        },
    });

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

    if (!queryJSON) {
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
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            offlineIndicatorStyle={styles.mtAuto}
        >
            {!selectionMode?.isEnabled ? (
                <>
                    <View style={[styles.zIndex10, styles.appBG]}>
                        <TopBar
                            activeWorkspaceID={policyID}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                            shouldDisplaySearchRouter={shouldUseNarrowLayout}
                            isCustomSearchQuery={shouldUseNarrowLayout && !SearchUtils.isCannedSearchQuery(queryJSON)}
                        />
                    </View>
                    {shouldUseNarrowLayout ? (
                        <Animated.View style={[styles.searchTopBarStyle, topBarAnimatedStyle]}>
                            <SearchTypeMenu
                                queryJSON={queryJSON}
                                searchName={searchName}
                            />
                            <SearchStatusBar
                                type={queryJSON.type}
                                status={queryJSON.status}
                                policyID={queryJSON.policyID}
                                onStatusChange={() => {
                                    topBarOffset.value = withTiming(variables.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS});
                                }}
                            />
                        </Animated.View>
                    ) : (
                        <SearchTypeMenu
                            queryJSON={queryJSON}
                            searchName={searchName}
                        />
                    )}
                </>
            ) : (
                <SearchSelectionModeHeader queryJSON={queryJSON} />
            )}
            {shouldUseNarrowLayout && (
                <Search
                    queryJSON={queryJSON}
                    onSearchListScroll={scrollHandler}
                    contentContainerStyle={!selectionMode?.isEnabled ? [styles.searchListContentContainerStyles] : undefined}
                />
            )}
            <BottomTabBar selectedTab={SCREENS.SEARCH.CENTRAL_PANE} />
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
