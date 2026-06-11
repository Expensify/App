import type {ParamListBase} from '@react-navigation/native';
import {isModalActiveSelector} from '@selectors/Modal';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchResultsActions, useSearchResultsContext} from '@components/Search/SearchContext';
import Tooltip from '@components/Tooltip';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import SearchTypeMenuWide from '@pages/Search/SearchTypeMenuWide';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {
    useSearchSidebarCollapse,
    useSearchSidebarCollapseFadeStyle,
    useSearchSidebarLayoutWidthStyle,
    useSearchSidebarToggleButtonStyle,
    useSearchSidebarVisualWidthStyle,
} from './SearchSidebarCollapseStore';
import TopBar from './TopBar';

type SearchSidebarProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

type PointerPosition = {
    clientX: number;
    clientY: number;
};

function SearchSidebar({state}: SearchSidebarProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isCollapsed, isPeeking, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();
    const [isAnyModalActive = false] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});
    const isAnyModalActiveRef = useRef(false);
    const wasAnyModalActiveRef = useRef(false);
    const isSidebarHoveredRef = useRef(false);
    const latestPointerPositionRef = useRef<PointerPosition | null>(null);
    const sidebarElementRef = useRef<HTMLElement | null>(null);
    const layoutSpacerStyle = useSearchSidebarLayoutWidthStyle();
    const visualSidebarWidthStyle = useSearchSidebarVisualWidthStyle();
    const breadcrumbAnimatedStyle = useSearchSidebarCollapseFadeStyle();
    const toggleButtonAnimatedStyle = useSearchSidebarToggleButtonStyle();

    const route = state.routes.at(-1);
    const {lastSearchType, currentSearchResults} = useSearchResultsContext();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {setLastSearchType} = useSearchResultsActions();

    const searchType = currentSearchResults?.search?.type;
    const isSearchLoading = currentSearchResults?.search?.isLoading;

    useEffect(() => {
        if (!searchType) {
            return;
        }

        setLastSearchType(searchType);
    }, [lastSearchType, setLastSearchType, searchType]);

    useEffect(() => {
        if (shouldUseNarrowLayout) {
            endPeek();
        }

        return endPeek;
    }, [endPeek, shouldUseNarrowLayout]);

    const updateLatestPointerPosition = (event?: PointerEvent) => {
        if (!event) {
            return;
        }

        latestPointerPositionRef.current = {
            clientX: event.clientX,
            clientY: event.clientY,
        };
    };

    const isPointerInsideSidebar = () => {
        const sidebarElement = sidebarElementRef.current;

        if (!sidebarElement) {
            return isSidebarHoveredRef.current;
        }

        const latestPointerPosition = latestPointerPositionRef.current;
        if (!latestPointerPosition) {
            return sidebarElement.matches(':hover');
        }

        const sidebarBounds = sidebarElement.getBoundingClientRect();
        return (
            latestPointerPosition.clientX >= sidebarBounds.left &&
            latestPointerPosition.clientX <= sidebarBounds.right &&
            latestPointerPosition.clientY >= sidebarBounds.top &&
            latestPointerPosition.clientY <= sidebarBounds.bottom
        );
    };

    const endPeekIfPointerIsOutsideSidebar = (event?: PointerEvent) => {
        updateLatestPointerPosition(event);

        const hasDocument = typeof document !== 'undefined';
        const isPointerInside = hasDocument ? isPointerInsideSidebar() : isSidebarHoveredRef.current;
        isSidebarHoveredRef.current = isPointerInside;

        if (!isPeeking || isAnyModalActiveRef.current || !hasDocument) {
            return;
        }

        if (isPointerInside) {
            return;
        }

        endPeek();
    };

    const markSidebarHovered = () => {
        isSidebarHoveredRef.current = true;
    };

    const endPeekWhenNoModalIsActive = () => {
        isSidebarHoveredRef.current = false;

        if (isAnyModalActiveRef.current) {
            return;
        }

        endPeek();
    };

    useEffect(() => {
        isAnyModalActiveRef.current = isAnyModalActive;
    }, [isAnyModalActive]);

    useEffect(() => {
        if (!isPeeking || typeof document === 'undefined') {
            return;
        }

        document.addEventListener('pointermove', endPeekIfPointerIsOutsideSidebar);
        document.addEventListener('pointerdown', endPeekIfPointerIsOutsideSidebar);
        document.addEventListener('pointerup', endPeekIfPointerIsOutsideSidebar);

        return () => {
            document.removeEventListener('pointermove', endPeekIfPointerIsOutsideSidebar);
            document.removeEventListener('pointerdown', endPeekIfPointerIsOutsideSidebar);
            document.removeEventListener('pointerup', endPeekIfPointerIsOutsideSidebar);
        };
    }, [endPeekIfPointerIsOutsideSidebar, isPeeking]);

    useEffect(() => {
        const wasAnyModalActive = wasAnyModalActiveRef.current;
        wasAnyModalActiveRef.current = isAnyModalActive;

        if (!wasAnyModalActive || isAnyModalActive || typeof window === 'undefined') {
            return;
        }

        const animationFrame = window.requestAnimationFrame(() => endPeekIfPointerIsOutsideSidebar());

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [endPeekIfPointerIsOutsideSidebar, isAnyModalActive, isPeeking]);

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!isSearchLoading;

    if (shouldUseNarrowLayout) {
        return null;
    }

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
        <Animated.View style={layoutSpacerStyle}>
            <Hoverable
                ref={sidebarElementRef}
                onHoverIn={markSidebarHovered}
                onHoverOut={endPeekWhenNoModalIsActive}
            >
                <Animated.View style={[styles.searchSidebar, styles.stickToLeft, styles.zIndex1, visualSidebarWidthStyle]}>
                    <View style={styles.flex1}>
                        <TopBar
                            shouldShowLoadingBar={shouldShowLoadingState || shouldShowLoadingBarForReports}
                            breadcrumbLabel={translate('common.spend')}
                            breadcrumbAnimatedStyle={breadcrumbAnimatedStyle}
                            shouldDisplaySearch={false}
                            shouldDisplayHelpButton={false}
                        >
                            {toggleButton}
                        </TopBar>
                        <Hoverable onHoverIn={startPeek}>
                            <View style={styles.flex1}>
                                <SearchTypeMenuWide queryJSON={currentSearchQueryJSON} />
                            </View>
                        </Hoverable>
                    </View>
                </Animated.View>
            </Hoverable>
        </Animated.View>
    );
}

export default SearchSidebar;
