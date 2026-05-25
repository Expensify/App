import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';
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
import {useSearchSidebarCollapse} from './SearchSidebarCollapseStore';
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
    const {collapseProgress, peekProgress, isCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();

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

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!isSearchLoading;

    // Animated style for the layout spacer — only tracks collapseProgress (not peek)
    // so content marginLeft stays in sync with the collapsed width
    const layoutSpacerStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        return {
            width: variables.searchSidebarExpandedWidth + (variables.searchSidebarCollapsedWidth - variables.searchSidebarExpandedWidth) * progress,
        };
    });

    // Animated style for the overlay sidebar — tracks both collapse and peek
    const overlayAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {
            width: variables.searchSidebarCollapsedWidth + (variables.searchSidebarExpandedWidth - variables.searchSidebarCollapsedWidth) * visualExpansion,
            opacity: isCollapsed ? 1 : 1,
        };
    });

    // Animated style for breadcrumb label fade
    const breadcrumbAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        return {
            opacity: 1 - progress,
            transform: [{translateX: -8 * progress}],
        };
    });

    if (shouldUseNarrowLayout) {
        return null;
    }

    return (
        <>
            {/* Layout spacer — pushes content to the right, tracks collapsed width */}
            <Animated.View style={layoutSpacerStyle} />

            {/* Hoverable wrapper for peek behavior */}
            <Hoverable
                onHoverIn={startPeek}
                onHoverOut={endPeek}
            >
                <Animated.View
                    style={[
                        styles.searchSidebar,
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 10,
                        },
                        overlayAnimatedStyle,
                    ]}
                >
                    <View style={styles.flex1}>
                        <TopBar
                            breadcrumbLabel={translate('common.spend')}
                            shouldDisplayHelpButton={false}
                            shouldShowLoadingBar={shouldShowLoadingState}
                            breadcrumbAnimatedStyle={breadcrumbAnimatedStyle}
                        >
                            <PressableWithoutFeedback
                                onPress={toggleSidebar}
                                accessibilityLabel={translate('common.collapse')}
                                role={CONST.ROLE.BUTTON}
                            >
                                <View style={[styles.p2]}>
                                    <Icon
                                        src={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
                                        width={20}
                                        height={20}
                                        fill={theme.icon}
                                    />
                                </View>
                            </PressableWithoutFeedback>
                        </TopBar>
                        <SearchTypeMenuWide
                            queryJSON={currentSearchQueryJSON}
                            onSelectionChangeScroll={() => {}}
                        />
                    </View>
                </Animated.View>
            </Hoverable>
        </>
    );
}

export default SearchSidebar;
