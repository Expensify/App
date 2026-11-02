import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';
import {PreloadedTabContentReadyContext} from '@hooks/useMarkPreloadedTabContentReady';
import useShouldMountPreloadedTabContent from '@hooks/useShouldMountPreloadedTabContent';

import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import {clearSearchTabContentReady, getIsSearchTabHovered, markSearchTabContentReady, subscribeToSearchTabHover} from '@libs/Navigation/helpers/searchTabPreloadStore';
import {isTabRoutePreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';

import createSearchFullscreenNavigator from '@navigation/AppNavigator/createSearchFullscreenNavigator';
import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';

import CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

import {useNavigationState} from '@react-navigation/native';
import React, {useEffect, useState, useSyncExternalStore} from 'react';

const loadSearchPage = () => require<ReactComponentModule>('@pages/Search/SearchPage').default;

const Stack = createSearchFullscreenNavigator<SearchFullscreenNavigatorParamList>();

function SearchFullscreenNavigator({route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR>) {
    // These options can be used here because the full screen navigator has the same structure as the split navigator in terms of the central screens, but it does not have a sidebar.
    const {centralScreen: centralScreenOptions} = useSplitNavigatorScreenOptions();

    // True from the idle preload until the tab is first opened. The page holds its request while it is set.
    const isInPreloadedTab = useNavigationState((tabState) => isTabRoutePreloaded(tabState, route.key));

    const shouldRenderContent = useShouldMountPreloadedTabContent(isInPreloadedTab);

    // A preloaded tab stays unfrozen only until its first content is on screen. Frozen after that, it stops re-rendering on
    // every data change while hidden, and catches up once when the user opens it.
    const [isPreloadedContentReady, setIsPreloadedContentReady] = useState(false);
    const markPreloadedContentReady = () => {
        if (!isInPreloadedTab || isPreloadedContentReady) {
            return;
        }
        setIsPreloadedContentReady(true);
        markSearchTabContentReady();
        endSpan(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB);
    };

    // Opened before its first content was on screen, so the preload span has no background build to report.
    useEffect(() => {
        if (isInPreloadedTab || isPreloadedContentReady) {
            return;
        }
        cancelSpan(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB);
    }, [isInPreloadedTab, isPreloadedContentReady]);

    // Once opened, a later tap no longer reveals a preloaded tab.
    useEffect(() => {
        if (isInPreloadedTab) {
            return;
        }
        clearSearchTabContentReady();
    }, [isInPreloadedTab]);

    // Unmounted before its first content was on screen, e.g. on sign out, nothing else would end the preload span.
    useEffect(
        () => () => {
            clearSearchTabContentReady();
            cancelSpan(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB);
        },
        [route.key],
    );

    // Hovering the tab button unfreezes it ahead of the click, so the catch-up render runs before the user opens it.
    // Once opened the snapshot stays false, so later hovers no longer re-render the navigator.
    const isPreloadedTabHovered = useSyncExternalStore(subscribeToSearchTabHover, () => isInPreloadedTab && getIsSearchTabHovered());

    return (
        <FreezeWrapper shouldStayUnfrozen={isInPreloadedTab && (!isPreloadedContentReady || isPreloadedTabHovered)}>
            <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
                <PreloadedTabContentReadyContext.Provider value={markPreloadedContentReady}>
                    {shouldRenderContent && (
                        <Stack.Navigator
                            screenOptions={centralScreenOptions}
                            defaultCentralScreen={SCREENS.SEARCH.ROOT}
                            parentRoute={route}
                        >
                            <Stack.Screen
                                name={SCREENS.SEARCH.ROOT}
                                getComponent={loadSearchPage}
                                initialParams={{q: SearchQueryUtils.buildSearchQueryString()}}
                                options={{animation: Animations.NONE}}
                            />
                        </Stack.Navigator>
                    )}
                </PreloadedTabContentReadyContext.Provider>
            </IsInPreloadedTabContext.Provider>
        </FreezeWrapper>
    );
}

export default SearchFullscreenNavigator;
