import type {NavigationState, PartialState} from '@react-navigation/routers';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import startSearchPageVisibleSpan from '@components/Search/SearchRouter/startSearchPageVisibleSpan';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {startSpan} from '@libs/telemetry/activeSpans';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import variables from '@styles/variables';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

const GLOBAL_NAV_BAR_HEIGHT = 44;

const NAVIGATORS_WITH_LHN = new Set<string>([
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
]);

function isOnNavigatorWithLHN(state: NavigationState | PartialState<NavigationState> | undefined): boolean {
    if (!state || state.index === undefined) {
        return false;
    }
    const route = state.routes.at(state.index);
    if (!route) {
        return false;
    }
    if (NAVIGATORS_WITH_LHN.has(route.name)) {
        return true;
    }
    return isOnNavigatorWithLHN(route.state);
}

function isOnSettings(state: NavigationState | PartialState<NavigationState> | undefined): boolean {
    if (!state || state.index === undefined) {
        return false;
    }
    const route = state.routes.at(state.index);
    if (!route) {
        return false;
    }
    if (route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR) {
        return true;
    }
    return isOnSettings(route.state);
}

const GHOST_INNER_STYLE = {backgroundColor: 'transparent'};

function GlobalNavBar() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const shouldShowBorder = useRootNavigationState(isOnNavigatorWithLHN);
    const isAccountSelected = useRootNavigationState(isOnSettings);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass', 'Sparkles']);
    const {openSearchRouter} = useSearchRouterActions();
    const {openSidePanel} = useSidePanelActions();

    const ghostHoverStyle = {backgroundColor: theme.hoverComponentBG};
    const ghostTextStyle = {color: theme.textSupporting};

    const onSearchPress = useCallback(() => {
        callFunctionIfActionIsAllowed(() => {
            startSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER, {
                name: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
                op: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
                attributes: {
                    [CONST.TELEMETRY.ATTRIBUTE_TRIGGER]: 'button',
                },
            });
            startSearchPageVisibleSpan();
            openSearchRouter();
        })();
    }, [openSearchRouter]);

    const onAccountPress = useCallback(() => {
        if (isAccountSelected) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    }, [isAccountSelected]);

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: variables.navigationTabBarSize,
                right: 0,
                height: GLOBAL_NAV_BAR_HEIGHT,
                backgroundColor: theme.appBG,
                zIndex: 10,
            }}
            testID="GlobalNavBar"
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pl3, styles.pr5]}>
                <Button
                    small
                    icon={expensifyIcons.MagnifyingGlass}
                    text="Find anything..."
                    innerStyles={GHOST_INNER_STYLE}
                    hoverStyles={ghostHoverStyle}
                    textStyles={ghostTextStyle}
                    iconFill={theme.textSupporting}
                    onPress={onSearchPress}
                />
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    <Button
                        small
                        icon={expensifyIcons.Sparkles}
                        text="Ask Concierge"
                        innerStyles={GHOST_INNER_STYLE}
                        hoverStyles={ghostHoverStyle}
                        textStyles={ghostTextStyle}
                        iconFill={theme.textSupporting}
                        onPress={openSidePanel}
                    />
                    <NavigationTabBarAvatar
                        isSelected={isAccountSelected}
                        onPress={onAccountPress}
                        shouldShowLabel={false}
                        wrapperStyle={styles.alignItemsCenter}
                    />
                </View>
            </View>
            {shouldShowBorder && (
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 1,
                        backgroundColor: theme.border,
                    }}
                />
            )}
        </View>
    );
}

export {GLOBAL_NAV_BAR_HEIGHT};
export default GlobalNavBar;
