import type {NavigationState, PartialState} from '@react-navigation/routers';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import startSearchPageVisibleSpan from '@components/Search/SearchRouter/startSearchPageVisibleSpan';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startSpan} from '@libs/telemetry/activeSpans';
import variables from '@styles/variables';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

const GLOBAL_NAV_BAR_HEIGHT = 52;

const NAVIGATORS_WITH_BOTTOM_BORDER = new Set<string>([NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]);

function isOnNavigatorWithBottomBorder(state: NavigationState | PartialState<NavigationState> | undefined): boolean {
    if (!state) {
        return false;
    }
    // In tab navigators, only the focused tab is visible — so we only descend that branch.
    // In stack-like navigators, RHP-style overlays sit on top of LHN siblings underneath, so we scan all routes.
    if (state.type === 'tab') {
        if (state.index === undefined) {
            return false;
        }
        const route = state.routes.at(state.index);
        if (!route) {
            return false;
        }
        if (NAVIGATORS_WITH_BOTTOM_BORDER.has(route.name)) {
            return true;
        }
        return isOnNavigatorWithBottomBorder(route.state);
    }
    return state.routes.some((route) => {
        if (NAVIGATORS_WITH_BOTTOM_BORDER.has(route.name)) {
            return true;
        }
        return isOnNavigatorWithBottomBorder(route.state);
    });
}

function GlobalNavBar() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const shouldShowBorder = useRootNavigationState(isOnNavigatorWithBottomBorder);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass', 'Sparkles']);
    const {openSearchRouter} = useSearchRouterActions();
    const {openSidePanel} = useSidePanelActions();
    const {shouldHideSidePanel} = useSidePanelState();
    const conciergeOpacity = useSharedValue(shouldHideSidePanel ? 1 : 0);
    useEffect(() => {
        conciergeOpacity.set(withTiming(shouldHideSidePanel ? 1 : 0, {duration: 200}));
    }, [shouldHideSidePanel, conciergeOpacity]);
    const conciergeAnimatedStyle = useAnimatedStyle(() => ({opacity: conciergeOpacity.get()}));

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

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: variables.navigationTabBarSize,
                right: 0,
                height: GLOBAL_NAV_BAR_HEIGHT,
                backgroundColor: theme.appBG,
                borderTopLeftRadius: 16,
                zIndex: 10,
            }}
            testID="GlobalNavBar"
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pl2, styles.pr5]}>
                <PressableWithFeedback
                    accessibilityLabel="Find anything..."
                    role={CONST.ROLE.BUTTON}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ph3, {height: 40, borderRadius: variables.buttonBorderRadius, marginBottom: 1}]}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SEARCH_BUTTON}
                    onPress={onSearchPress}
                >
                    {({hovered}) => (
                        <>
                            <Icon
                                src={expensifyIcons.MagnifyingGlass}
                                fill={theme.textSupporting}
                                width={16}
                                height={16}
                            />
                            <Text style={[styles.buttonText, styles.buttonMediumText, {color: hovered ? theme.text : theme.textSupporting}]}>Find anything...</Text>
                            <Badge
                                isCondensed
                                badgeStyles={{marginLeft: 0}}
                            >
                                <Text style={{fontWeight: 'normal', color: theme.textSupporting, fontSize: variables.fontSizeExtraSmall}}>⌘</Text>K
                            </Badge>
                        </>
                    )}
                </PressableWithFeedback>
                <Animated.View
                    style={conciergeAnimatedStyle}
                    pointerEvents={shouldHideSidePanel ? 'auto' : 'none'}
                >
                    <PressableWithFeedback
                        accessibilityLabel="Ask Concierge"
                        role={CONST.ROLE.BUTTON}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ph3, {height: 40, borderRadius: variables.buttonBorderRadius, marginBottom: 1}]}
                        sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                        onPress={openSidePanel}
                    >
                        {({hovered}) => (
                            <>
                                <Icon
                                    src={expensifyIcons.Sparkles}
                                    fill={theme.textSupporting}
                                    width={16}
                                    height={16}
                                />
                                <Text style={[styles.buttonText, styles.buttonMediumText, {color: hovered ? theme.text : theme.textSupporting}]}>Ask Concierge</Text>
                            </>
                        )}
                    </PressableWithFeedback>
                </Animated.View>
            </View>
            {shouldShowBorder && (
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 1,
                        backgroundColor: theme.borderLight,
                    }}
                />
            )}
        </View>
    );
}

export {GLOBAL_NAV_BAR_HEIGHT};
export default GlobalNavBar;
