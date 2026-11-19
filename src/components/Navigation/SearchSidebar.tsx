import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';

import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useSearchResultsActions, useSearchResultsContext} from '@components/Search/SearchContext';
import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getHadTabNavigation from '@libs/hadTabNavigation';
import isHTMLElement from '@libs/isHTMLElement';

import SearchTypeMenuWide from '@pages/Search/SearchTypeMenuWide';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import useShouldUseFlatNavigationBar from './FlatNavigationBar/useShouldUseFlatNavigationBar';
import PeekSurfaceContext from './PeekSurfaceContext';
import {
    useSearchSidebarCollapse,
    useSearchSidebarCollapseFadeStyle,
    useSearchSidebarLayoutWidthStyle,
    useSearchSidebarToggleButtonStyle,
    useSearchSidebarVisualWidthStyle,
} from './SearchSidebarCollapseStore';
import TopBar from './TopBar';
import useSearchLoadingBarVisibility from './useSearchLoadingBarVisibility';

/** The Spend column, which users outside the flat nav beta see beside wide Search. */
function SpendColumn() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isCollapsed, isPeeking, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();
    const layoutSpacerStyle = useSearchSidebarLayoutWidthStyle();
    const visualSidebarWidthStyle = useSearchSidebarVisualWidthStyle();
    const breadcrumbAnimatedStyle = useSearchSidebarCollapseFadeStyle();
    const toggleButtonAnimatedStyle = useSearchSidebarToggleButtonStyle();
    const shouldShowLoadingBar = useSearchLoadingBarVisibility();
    const sidebarRef = useRef<HTMLElement>(null);
    const openMenuCountRef = useRef(0);

    // The hover-out event never fires if the column unmounts while hovered, so end the peek here.
    useEffect(() => endPeek, [endPeek]);

    // A saved search's menu opens partly outside the sidebar. Ending the peek while it is open would collapse the list and unmount the menu.
    const endPeekUnlessMenuOpen = () => {
        if (openMenuCountRef.current > 0) {
            return;
        }
        endPeek();
    };

    const holdPeek = () => {
        openMenuCountRef.current += 1;
    };

    // The menu is portaled outside the sidebar, so when it closes no hover-out reaches the sidebar, and the pointer is read against the sidebar instead.
    // A keyboard user holds the peek too, because collapsing would unmount the menu's button, where the next Tab continues from.
    // Focus is not back on the button when the menu is gone, so the keyboard modality is read instead of the focus.
    const releasePeek = () => {
        openMenuCountRef.current = Math.max(0, openMenuCountRef.current - 1);
        const element = sidebarRef.current;
        if (openMenuCountRef.current > 0 || getHadTabNavigation() || (isHTMLElement(element) && element.matches(':hover'))) {
            return;
        }
        endPeek();
    };

    // A held peek outlives the pointer, so leaving the sidebar by Tab or a click sends no hover-out. Focus landing elsewhere ends it instead,
    // and a click on the page focuses its container. Focus leaving the sidebar is not watched, because a closed menu leaves focus on the body.
    useEffect(() => {
        const element = sidebarRef.current;
        if (!isPeeking || !isHTMLElement(element)) {
            return;
        }
        const endPeekIfFocusLeft = (event: FocusEvent) => {
            if (openMenuCountRef.current > 0 || (event.target instanceof Node && element.contains(event.target)) || element.matches(':hover')) {
                return;
            }
            endPeek();
        };
        document.addEventListener('focusin', endPeekIfFocusLeft);
        return () => document.removeEventListener('focusin', endPeekIfFocusLeft);
    }, [endPeek, isPeeking]);
    const toggleButtonLabel = translate(isCollapsed ? 'reportActionCompose.expand' : 'reportActionCompose.collapse');
    const toggleButton = (
        <Tooltip text={toggleButtonLabel}>
            <Animated.View style={toggleButtonAnimatedStyle}>
                <PressableWithoutFeedback
                    accessibilityLabel={toggleButtonLabel}
                    onPress={toggleSidebar}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SIDEBAR_TOGGLE}
                    style={[styles.p2, styles.br2]}
                >
                    <Icon
                        src={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Animated.View>
        </Tooltip>
    );

    return (
        <PeekSurfaceContext.Provider value={{holdPeek, releasePeek}}>
            <Animated.View style={layoutSpacerStyle}>
                <Hoverable
                    ref={sidebarRef}
                    onHoverOut={endPeekUnlessMenuOpen}
                >
                    <Animated.View style={[styles.searchSidebar, styles.stickToLeft, styles.zIndex1, visualSidebarWidthStyle]}>
                        <View style={styles.flex1}>
                            <TopBar
                                shouldShowLoadingBar={shouldShowLoadingBar}
                                breadcrumbLabel={translate('common.spend')}
                                breadcrumbAnimatedStyle={breadcrumbAnimatedStyle}
                                shouldDisplaySearch={false}
                                shouldDisplayHelpButton={false}
                            >
                                {toggleButton}
                            </TopBar>
                            <Hoverable onHoverIn={startPeek}>
                                <View style={styles.flex1}>
                                    <SearchTypeMenuWide />
                                </View>
                            </Hoverable>
                        </View>
                    </Animated.View>
                </Hoverable>
            </Animated.View>
        </PeekSurfaceContext.Provider>
    );
}

/**
 * Keeps the last search type up to date. Draws the Spend column only outside the flat nav beta, since the bar and the Search page replace it.
 */
function SearchSidebar() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();
    const {lastSearchType, currentSearchResults} = useSearchResultsContext();
    const {setLastSearchType} = useSearchResultsActions();

    const searchType = currentSearchResults?.search?.type;

    useEffect(() => {
        if (!searchType) {
            return;
        }

        setLastSearchType(searchType);
    }, [lastSearchType, setLastSearchType, searchType]);

    if (shouldUseNarrowLayout || shouldUseFlatNavigationBar) {
        return null;
    }

    return <SpendColumn />;
}

export default SearchSidebar;
