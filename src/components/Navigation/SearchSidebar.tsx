import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const {collapseProgress, isCollapsed, toggleSidebar} = useSearchSidebarCollapse();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);

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

    const sidebarAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        return {
            width: variables.searchSidebarExpandedWidth + (variables.searchSidebarCollapsedWidth - variables.searchSidebarExpandedWidth) * progress,
        };
    });

    const chevronAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${collapseProgress.get() * 180}deg`}],
    }));

    const breadcrumbAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapseProgress.get();
        return {
            opacity: 1 - progress,
            transform: [{translateX: -8 * progress}],
        };
    });

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!isSearchLoading;

    if (shouldUseNarrowLayout) {
        return null;
    }

    const toggleButton = (
        <PressableWithoutFeedback
            accessibilityLabel="Toggle sidebar"
            onPress={toggleSidebar}
            sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.CANCEL_BUTTON}
            style={[styles.p2, styles.br2]}
        >
            <Animated.View style={chevronAnimatedStyle}>
                <Icon
                    src={icons.BackArrow}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            </Animated.View>
        </PressableWithoutFeedback>
    );

    return (
        <Animated.View style={[styles.searchSidebar, sidebarAnimatedStyle]}>
            <View style={styles.flex1}>
                {isCollapsed ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.headerBarHeight]}>{toggleButton}</View>
                ) : (
                    <TopBar
                        shouldShowLoadingBar={shouldShowLoadingState || shouldShowLoadingBarForReports}
                        breadcrumbLabel={translate('common.spend')}
                        breadcrumbAnimatedStyle={breadcrumbAnimatedStyle}
                        shouldDisplaySearch={false}
                        shouldDisplayHelpButton={false}
                    >
                        {toggleButton}
                    </TopBar>
                )}
                <SearchTypeMenuWide queryJSON={currentSearchQueryJSON} />
            </View>
        </Animated.View>
    );
}

export default SearchSidebar;
