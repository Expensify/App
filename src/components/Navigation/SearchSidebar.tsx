import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import MenuIcon from '@assets/images/menu.svg';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import SearchTypeMenuWide from '@pages/Search/SearchTypeMenuWide';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import {useSidebarCollapse} from './SidebarCollapseStore';
import TopBar from './TopBar';

type SearchSidebarProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

function SearchSidebar({state}: SearchSidebarProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {collapseProgress, peekProgress, isCollapsed, toggleSidebar, startPeek, endPeek} = useSidebarCollapse();

    const route = state.routes.at(-1);
    const {lastSearchType, currentSearchResults, currentSearchQueryJSON} = useSearchStateContext();
    const {setLastSearchType} = useSearchActionsContext();

    const searchType = currentSearchResults?.search?.type;
    const isSearchLoading = currentSearchResults?.search?.isLoading;

    useEffect(() => {
        if (!searchType) {
            return;
        }

        setLastSearchType(searchType);
    }, [lastSearchType, setLastSearchType, searchType]);

    // Layout spacer: tracks only collapseProgress so screen content marginLeft stays in lockstep.
    const layoutSpacerStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        return {
            width: variables.searchSidebarExpandedWidth + (variables.searchSidebarCollapsedWidth - variables.searchSidebarExpandedWidth) * progress,
        };
    });

    // Visual overlay: width grows during peek without affecting layout.
    const overlayAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {
            width: variables.searchSidebarCollapsedWidth + (variables.searchSidebarExpandedWidth - variables.searchSidebarCollapsedWidth) * visualExpansion,
        };
    });

    // Shift the chevron button left so it sits at the sidebar's horizontal center when fully collapsed.
    // 10px = chevron's right-anchored center (sidebar - mr3 - chevronHalfWidth = 76 - 12 - 16 = 48) minus sidebar center (76/2 = 38).
    const chevronContainerAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {transform: [{translateX: -10 * (1 - visualExpansion)}]};
    });

    const chevronAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {transform: [{rotate: `${(1 - visualExpansion) * 180}deg`}]};
    });

    const breadcrumbAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {
            opacity: visualExpansion,
            transform: [{translateX: -8 * (1 - visualExpansion)}],
        };
    });

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!isSearchLoading;

    if (shouldUseNarrowLayout) {
        return null;
    }

    const toggleButton = (
        <Animated.View style={chevronContainerAnimatedStyle}>
            <PressableWithoutFeedback
                accessibilityLabel="Toggle sidebar"
                onPress={toggleSidebar}
                sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.CANCEL_BUTTON}
                style={[styles.p2, styles.br2]}
            >
                <Animated.View style={chevronAnimatedStyle}>
                    <Icon
                        src={MenuIcon}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                        fill={theme.icon}
                    />
                </Animated.View>
            </PressableWithoutFeedback>
        </Animated.View>
    );

    return (
        <Animated.View style={[{height: '100%'}, layoutSpacerStyle]}>
            <Hoverable
                isDisabled={!isCollapsed}
                onHoverIn={startPeek}
                onHoverOut={endPeek}
            >
                <Animated.View style={[styles.searchSidebar, overlayAnimatedStyle, {position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 1}]}>
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
                        <SearchTypeMenuWide queryJSON={currentSearchQueryJSON} />
                    </View>
                </Animated.View>
            </Hoverable>
        </Animated.View>
    );
}

export default SearchSidebar;
