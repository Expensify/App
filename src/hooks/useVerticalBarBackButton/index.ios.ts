/**
 * Gives a header with a back button a second one in the vertical bar of a foldable iPhone, where UIKit keeps the back
 * button of a navigation bar: at the top, under the status items. UIKit only does that for the items of a native bar
 * that is shown, so the screen gets a transparent bar with no title, whose only content is this button.
 */
import ModalContext from '@components/Modal/ModalContext';

import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical';
import VerticalBarTabsScreenContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';

import variables from '@styles/variables';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {NavigationContext, NavigationRouteContext} from '@react-navigation/native';
import {useContext, useEffectEvent, useLayoutEffect, useSyncExternalStore} from 'react';

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
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const hasVerticalBar = useIsTabBarVertical();
    // A modal covers the screen and its bars, so a button there could not be reached.
    const isInModal = !useContext(ModalContext).default;
    // The bar of a phone folded in landscape has room for one item above the tab bar. While the tab bar is shown, that
    // is the create button, so the back button stays out, and the header's own is the only one.
    const hasRoom = windowHeight >= variables.iosVerticalBarSeveralItemsMinHeight || !tabsScreen?.hasBarItems;
    const isInVerticalBar = shouldShowBackButton && hasVerticalBar && hasRoom && !isInModal;
    // While the tab bar is shown, the bar of the screen that holds the tabs has the create and scan buttons. UIKit lays
    // each bar's items out from the top of the vertical bar on its own, so the button joins that bar to end up over them.
    // Tab screens stay mounted while another one is shown, and only the one on screen may put its button there.
    const tabsBarNavigation = isScreenShown && tabsScreen?.hasBarItems ? tabsScreen.navigation : undefined;
    // UIKit moves the items of a bar into the vertical bar only when that bar reaches the edge the vertical bar is on.
    // The stacks of the tab screens do, as the tabs span the whole window. Screens presented over the tabs keep their
    // nested stacks out of the horizontal safe area, so there only the bar of the root stack's screen reaches the edge.
    // The screens of a flow share that bar, and only the one on screen may put its button there.
    const rootBarNavigation = isScreenShown ? getRootScreenNavigation(screenNavigation) : undefined;
    const ownBarNavigation = tabsScreen ? getStackScreenNavigation(screenNavigation) : rootBarNavigation;
    const label = translate('common.back');
    // The handler gets a new identity on most renders. Read through an effect event, a press runs the latest one
    // without the bar item being set again each time.
    const pressBackButton = useEffectEvent(goBack);

    useLayoutEffect(() => {
        if (!isInVerticalBar) {
            return;
        }
        const backItemOptions: NativeStackNavigationOptions = {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
            unstable_headerLeftItems: () => [{type: 'button', label, icon: {type: 'sfSymbol', name: 'chevron.backward'}, onPress: () => pressBackButton()}],
        };
        if (tabsBarNavigation) {
            tabsBarNavigation.setOptions(backItemOptions);
            // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
            return () => tabsBarNavigation.setOptions({unstable_headerLeftItems: undefined});
        }
        const options: NativeStackNavigationOptions = {
            ...backItemOptions,
            headerShown: true,
            headerTransparent: true,
            // The native back button would pop the screen itself and skip what the header does on a press.
            headerBackVisible: false,
            title: '',
        };
        if (!ownBarNavigation) {
            return;
        }
        ownBarNavigation.setOptions(options);
        return () => ownBarNavigation.setOptions(HIDDEN_BAR_OPTIONS);
    }, [ownBarNavigation, tabsBarNavigation, isInVerticalBar, label]);
};

export default useVerticalBarBackButton;
