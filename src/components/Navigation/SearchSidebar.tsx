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

const PEEK_DISMISS_AFTER_MODAL_CLOSE_DELAY_MS = Math.max(CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB, CONST.MODAL.ANIMATION_TIMING.CENTERED_DURATION_OUT_WEB) + 50;

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
    const delayedPeekDismissUntilRef = useRef(0);
    const isSidebarHoveredRef = useRef(false);
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

    const endPeekIfPointerIsOutsideSidebar = () => {
        if (!isPeeking || isAnyModalActiveRef.current || Date.now() < delayedPeekDismissUntilRef.current || typeof document === 'undefined') {
            return;
        }

        if (isSidebarHoveredRef.current) {
            return;
        }

        endPeek();
    };

    const markSidebarHovered = () => {
        isSidebarHoveredRef.current = true;
    };

    const endPeekWhenNoModalIsActive = () => {
        isSidebarHoveredRef.current = false;

        if (isAnyModalActiveRef.current || Date.now() < delayedPeekDismissUntilRef.current) {
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

        return () => {
            document.removeEventListener('pointermove', endPeekIfPointerIsOutsideSidebar);
        };
    }, [endPeekIfPointerIsOutsideSidebar, isPeeking]);

    useEffect(() => {
        const wasAnyModalActive = wasAnyModalActiveRef.current;
        wasAnyModalActiveRef.current = isAnyModalActive;

        if (!wasAnyModalActive || isAnyModalActive || typeof window === 'undefined') {
            return;
        }

        const dismissPeekAt = Date.now() + PEEK_DISMISS_AFTER_MODAL_CLOSE_DELAY_MS;
        delayedPeekDismissUntilRef.current = dismissPeekAt;
        const timeout = window.setTimeout(() => {
            if (delayedPeekDismissUntilRef.current === dismissPeekAt) {
                delayedPeekDismissUntilRef.current = 0;
            }

            endPeekIfPointerIsOutsideSidebar();
        }, PEEK_DISMISS_AFTER_MODAL_CLOSE_DELAY_MS);

        return () => {
            if (delayedPeekDismissUntilRef.current === dismissPeekAt) {
                delayedPeekDismissUntilRef.current = 0;
            }

            window.clearTimeout(timeout);
        };
    }, [endPeekIfPointerIsOutsideSidebar, isAnyModalActive]);

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
