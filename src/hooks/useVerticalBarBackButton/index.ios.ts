/**
 * Moves the back button of a header into the vertical bar of a foldable iPhone, where UIKit keeps the back button of a
 * navigation bar: at the top, under the status items. UIKit only does that for the items of a native bar that is shown,
 * so the screen gets a transparent bar with no title, whose only content is this button.
 */
import ModalContext from '@components/Modal/ModalContext';
import VerticalBarBackButton from '@components/VerticalBarBackButton';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical';
import VerticalBarTabsScreenContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackHeaderItem, NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {NavigationContext, NavigationRouteContext} from '@react-navigation/native';
import {createElement, useContext, useEffectEvent, useLayoutEffect, useSyncExternalStore} from 'react';

import type UseVerticalBarBackButton from './types';

/** What the screen is given to show the button, and what takes it away again. */
const HIDDEN_BAR_OPTIONS: NativeStackNavigationOptions = {
    headerShown: false,
    headerTransparent: undefined,
    headerBackVisible: undefined,
    title: undefined,
    // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
    unstable_headerLeftItems: undefined,
};

/**
 * The effect that put the button in each bar last. The screens of a flow share a bar, and the one that is left can learn
 * that it is no longer shown after the next one has put its button there, so it must not take that button away.
 */
const barOwners = new WeakMap<NavigationProp<ParamListBase>, symbol>();

/** The navigation of the closest stack screen. A header can sit in a navigator nested in that screen, such as tabs, which has no native bar. */
function getStackScreenNavigation(navigation: NavigationProp<ParamListBase> | undefined): NavigationProp<ParamListBase> | undefined {
    let stackScreenNavigation = navigation;
    while (stackScreenNavigation && stackScreenNavigation.getState().type !== 'stack') {
        stackScreenNavigation = stackScreenNavigation.getParent();
    }
    return stackScreenNavigation;
}

/** The navigation of the screen of the root stack that this screen is part of, through any number of nested navigators. */
function getRootScreenNavigation(navigation: NavigationProp<ParamListBase> | undefined): NavigationProp<ParamListBase> | undefined {
    let rootScreenNavigation = navigation;
    for (let parent = navigation?.getParent(); parent; parent = parent.getParent()) {
        rootScreenNavigation = parent;
    }
    return rootScreenNavigation;
}

/** Whether the screen and every navigator above it are the focused ones, which a screen in a tab that is not selected is not. */
function useIsScreenShown(navigation: NavigationProp<ParamListBase> | undefined, routeKey: string | undefined): boolean {
    const subscribe = (onChange: () => void) => {
        const unsubscribes: Array<() => void> = [];
        for (let current = navigation; current; current = current.getParent()) {
            unsubscribes.push(current.addListener('focus', onChange), current.addListener('blur', onChange));
        }
        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        };
    };
    const getIsScreenShown = () => {
        // A screen that is being closed is gone from the state, while its navigation still calls it focused.
        const state = navigation?.getState();
        if (state?.routes.at(state.index)?.key !== routeKey) {
            return false;
        }
        for (let current = navigation; current; current = current.getParent()) {
            if (!current.isFocused()) {
                return false;
            }
        }
        return true;
    };
    return useSyncExternalStore(subscribe, getIsScreenShown, getIsScreenShown);
}

const useVerticalBarBackButton: UseVerticalBarBackButton = (goBack, shouldShowBackButton = true) => {
    // Headers are also rendered outside a navigator, so the navigation is read from the context, which may be empty.
    const screenNavigation = useContext(NavigationContext);
    const tabsScreen = useContext(VerticalBarTabsScreenContext);
    const isScreenShown = useIsScreenShown(screenNavigation, useContext(NavigationRouteContext)?.key);
    const hasVerticalBar = useIsTabBarVertical();
    // A modal covers the screen and its bars, so a button there could not be reached.
    const isInModal = !useContext(ModalContext).default;
    // UIKit moves the items of a bar into the vertical bar only when that bar reaches the edge the vertical bar is on.
    // The stacks of the tab screens do, as the tabs span the whole window. Screens presented over the tabs keep their
    // nested stacks out of the horizontal safe area, so there only the bar of the root stack's screen reaches the edge.
    const barNavigation = tabsScreen ? getStackScreenNavigation(screenNavigation) : getRootScreenNavigation(screenNavigation);
    const isInVerticalBar = shouldShowBackButton && hasVerticalBar && !isInModal && !!barNavigation;
    // Tab screens stay mounted while another one is shown, and the screens of a flow share the bar of the root stack's
    // screen, so only the screen that is shown may put its button there.
    const shownBarNavigation = isInVerticalBar && isScreenShown ? barNavigation : undefined;
    const addTabsBackButton = tabsScreen?.addBackButton;
    // The handler gets a new identity on most renders. Read through an effect event, a press runs the latest one
    // without the bar item being set again each time.
    const pressBackButton = useEffectEvent(goBack);

    useLayoutEffect(() => {
        if (!shownBarNavigation) {
            return;
        }
        const owner = Symbol('verticalBarBackButton');
        barOwners.set(shownBarNavigation, owner);
        // The button brings its own glass, as the create and scan buttons do, so UIKit adds none behind it.
        const backItem: NativeStackHeaderItem = {
            type: 'custom',
            element: createElement(VerticalBarBackButton, {onPress: () => pressBackButton()}),
            hidesSharedBackground: true,
        };
        shownBarNavigation.setOptions({
            // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
            unstable_headerLeftItems: () => [backItem],
            headerShown: true,
            headerTransparent: true,
            // The native back button would pop the screen itself and skip what the header does on a press.
            headerBackVisible: false,
            title: '',
        });
        // The button takes the place of the create and scan buttons in the vertical bar, so the tabs take those out
        // while a tab screen shows it.
        const removeTabsBackButton = addTabsBackButton?.();
        return () => {
            removeTabsBackButton?.();
            if (barOwners.get(shownBarNavigation) !== owner) {
                return;
            }
            barOwners.delete(shownBarNavigation);
            shownBarNavigation.setOptions(HIDDEN_BAR_OPTIONS);
        };
    }, [shownBarNavigation, addTabsBackButton]);

    return isInVerticalBar;
};

export default useVerticalBarBackButton;
