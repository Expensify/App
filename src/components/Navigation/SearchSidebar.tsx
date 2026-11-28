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
    useSearchSidebarDockedWidthStyle,
    useSearchSidebarToggleButtonStyle,
    useSearchSidebarVisualWidthStyle,
} from './SearchSidebarCollapseStore';
import TopBar from './TopBar';
import useEndPeekOnFocusLeave from './useEndPeekOnFocusLeave';
import useSearchLoadingBarVisibility from './useSearchLoadingBarVisibility';

/** The Spend column, which users outside the flat nav beta see beside wide Search. */
function SpendColumn() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isCollapsed, isPeeking, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();
    const dockedWidthStyle = useSearchSidebarDockedWidthStyle();
    const visualSidebarWidthStyle = useSearchSidebarVisualWidthStyle();
    const breadcrumbAnimatedStyle = useSearchSidebarCollapseFadeStyle();
    const toggleButtonAnimatedStyle = useSearchSidebarToggleButtonStyle();
    const shouldShowLoadingBar = useSearchLoadingBarVisibility();
    const sidebarRef = useRef<HTMLElement>(null);

    // The hover-out event never fires if the column unmounts while hovered, so end the peek here.
    useEffect(() => endPeek, [endPeek]);

    // An open saved search menu holds the peek, because collapsing would unmount the menu. The menu is portaled outside the sidebar's DOM, so two things would
    // otherwise end the peek under it: the hover-out React sends through the portal when the pointer leaves the window from the menu's backdrop,
    // and focus moving into the menu. One flag is enough, because the backdrop keeps a second menu from opening before the first one is gone.
    const isPeekHeldRef = useRef(false);

    const endPeekUnlessHeld = () => {
        if (isPeekHeldRef.current) {
            return;
        }
        endPeek();
    };

    const holdPeekUntilMenuCloses = () => {
        isPeekHeldRef.current = true;
    };

    // A saved search's menu is portaled, so its closing sends the sidebar no hover-out and the pointer is read instead.
    // Keyboard focus keeps the peek, because Escape returns it to the menu's button, but mouse focus does not, so a clicked row cannot hold the peek.
    const endPeekIfPointerLeft = () => {
        isPeekHeldRef.current = false;
        const element = sidebarRef.current;
        if (isHTMLElement(element) && (element.matches(':hover') || !!element.querySelector(':focus-visible'))) {
            return;
        }
        endPeek();
    };

    useEndPeekOnFocusLeave(sidebarRef, isPeeking, endPeekUnlessHeld);

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
        <PeekSurfaceContext.Provider value={{holdPeekUntilMenuCloses, endPeekIfPointerLeft}}>
            <Animated.View style={[styles.stickToLeft, dockedWidthStyle]}>
                <Hoverable
                    ref={sidebarRef}
                    onHoverOut={endPeekUnlessHeld}
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
    const {currentSearchResults} = useSearchResultsContext();
    const {setLastSearchType} = useSearchResultsActions();

    const searchType = currentSearchResults?.search?.type;

    useEffect(() => {
        if (!searchType) {
            return;
        }

        setLastSearchType(searchType);
    }, [setLastSearchType, searchType]);

    if (shouldUseNarrowLayout || shouldUseFlatNavigationBar) {
        return null;
    }

    return <SpendColumn />;
}

export default SearchSidebar;
