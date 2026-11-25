/**
 * The native bar of a screen as the host of what the screen shows in the vertical bar of a foldable iPhone. UIKit lays
 * the items of a navigation bar out in that bar, next to the status items and the tab bar, and only does so for a bar
 * that is shown. The create and scan buttons and the back button share the bar of one screen, so the bar is shown for as
 * long as any of them needs it, and the back button stays the same item while one screen after another uses it.
 */
import VerticalBarBackButton from '@components/VerticalBarBackButton';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackHeaderItem} from '@react-navigation/native-stack';

import {createElement} from 'react';

type ScreenNavigation = NavigationProp<ParamListBase>;

/** A header that has a back button, on a screen that is mounted. */
type BackButtonOwner = {
    /** The navigation of the screen the header is on. */
    screenNavigation: ScreenNavigation;

    /** What a press on the button does while that screen is the one shown. */
    onPress: () => void;

    /** Whether that screen was the one shown in its root stack screen when that could last be told. */
    isShown: boolean;
};

type BackButton = {
    /** The headers that may have the button, in the order they came. */
    owners: BackButtonOwner[];

    /** The item of the button, the same one for as long as the bar exists, so UIKit keeps it in place between two screens. */
    item: NativeStackHeaderItem;

    /** Takes back the bar the button asked for. Set while the button is in the bar. */
    hideHost?: () => void;
};

/** How many things need the bar of each screen. */
const hostUseCounts = new WeakMap<ScreenNavigation, number>();

/** The back button of each bar, by the navigation of the screen the bar belongs to. */
const backButtons = new WeakMap<ScreenNavigation, BackButton>();

const backButtonListeners = new Set<() => void>();

/**
 * Shows the bar of a screen for something that has items in it. With no title the bar has nothing to draw along the top,
 * and a transparent one takes no room from the screen. Returns what hides the bar again once nothing else needs it.
 */
function showVerticalBarHost(navigation: ScreenNavigation): () => void {
    const useCount = hostUseCounts.get(navigation) ?? 0;
    hostUseCounts.set(navigation, useCount + 1);
    if (useCount === 0) {
        // The native back button would pop the screen itself and skip what a header does on a press.
        navigation.setOptions({headerShown: true, headerTransparent: true, headerBackVisible: false, title: ''});
    }
    return () => {
        const remainingUseCount = (hostUseCounts.get(navigation) ?? 1) - 1;
        hostUseCounts.set(navigation, remainingUseCount);
        if (remainingUseCount > 0) {
            return;
        }
        navigation.setOptions({headerShown: false, headerTransparent: undefined, headerBackVisible: undefined, title: undefined});
    };
}

/**
 * The navigation of the screen of the root stack that a screen is part of, through any number of nested navigators.
 * UIKit moves the items of a bar into the vertical bar only when that bar reaches the edge the vertical bar is on.
 * Nested stacks are kept out of the horizontal safe area, so only the bar of the root stack's screen does.
 */
function getRootScreenNavigation(navigation: ScreenNavigation): ScreenNavigation {
    let rootScreenNavigation = navigation;
    for (let parent = navigation.getParent(); parent; parent = parent.getParent()) {
        rootScreenNavigation = parent;
    }
    return rootScreenNavigation;
}

/** The header whose screen is shown. A screen that is being closed can still be one of two, and the one that came last is on top. */
function getShownOwner(backButton: BackButton): BackButtonOwner | undefined {
    return backButton.owners.findLast((owner) => owner.isShown);
}

function getBackButton(barNavigation: ScreenNavigation): BackButton {
    const existingBackButton = backButtons.get(barNavigation);
    if (existingBackButton) {
        return existingBackButton;
    }
    const backButton: BackButton = {
        owners: [],
        // The button brings its own glass, as the create and scan buttons do, so UIKit adds none behind it.
        item: {type: 'custom', element: createElement(VerticalBarBackButton, {onPress: () => getShownOwner(backButton)?.onPress()}), hidesSharedBackground: true},
    };
    backButtons.set(barNavigation, backButton);
    return backButton;
}

/**
 * Puts the button in the bar while the screen of one of its headers is shown, and takes it out otherwise.
 *
 * A screen is shown while it is the one on screen in the screen of the root stack it is part of: it and every navigator
 * between the two are the focused ones, which a screen in a tab that is not selected is not. That root screen has its
 * bar to itself, so it makes no difference whether another one covers it, and the button stays in its bar for when the
 * screen is uncovered. A navigation only tells whether its screen is focused all the way up, so while the root screen is
 * covered, what was found last still holds.
 */
function updateBackButton(barNavigation: ScreenNavigation) {
    const backButton = getBackButton(barNavigation);
    if (barNavigation.isFocused()) {
        for (const owner of backButton.owners) {
            owner.isShown = owner.screenNavigation.isFocused();
        }
    }
    const shouldBeInBar = !!getShownOwner(backButton);
    if (shouldBeInBar === !!backButton.hideHost) {
        return;
    }
    if (shouldBeInBar) {
        backButton.hideHost = showVerticalBarHost(barNavigation);
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        barNavigation.setOptions({unstable_headerLeftItems: () => [backButton.item]});
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        barNavigation.setOptions({unstable_headerLeftItems: undefined});
        backButton.hideHost?.();
        backButton.hideHost = undefined;
    }
    for (const listener of backButtonListeners) {
        listener();
    }
}

/**
 * Gives the back button of a header to the vertical bar for as long as the header is mounted. The button is in the bar
 * while the header's screen is shown, and a press then does what the header says.
 *
 * Which screen is shown is read from the navigation whenever a screen gains or loses focus, not from what the screens
 * render: a screen that is covered is frozen, and comes back to life only after the one over it has started to close.
 * The button would be gone in between, where it now stays in place from one screen to the next.
 *
 * Returns what takes the header's part in the button away.
 */
function addVerticalBarBackButton(screenNavigation: ScreenNavigation, onPress: () => void): () => void {
    const barNavigation = getRootScreenNavigation(screenNavigation);
    const backButton = getBackButton(barNavigation);
    const owner: BackButtonOwner = {screenNavigation, onPress, isShown: false};
    const update = () => updateBackButton(barNavigation);
    // A navigator tells its own screens about focus, so a change further up is heard there.
    const unsubscribes: Array<() => void> = [];
    for (let current: ScreenNavigation | undefined = screenNavigation; current; current = current.getParent()) {
        unsubscribes.push(current.addListener('focus', update), current.addListener('blur', update));
    }
    backButton.owners.push(owner);
    update();
    return () => {
        for (const unsubscribe of unsubscribes) {
            unsubscribe();
        }
        backButton.owners.splice(backButton.owners.indexOf(owner), 1);
        update();
    };
}

/** Whether the bar of a screen has a back button now. */
function hasVerticalBarBackButton(barNavigation: ScreenNavigation): boolean {
    return !!backButtons.get(barNavigation)?.hideHost;
}

/** Calls the listener whenever a bar gets or loses its back button. Returns what stops that. */
function subscribeToVerticalBarBackButtons(listener: () => void): () => void {
    backButtonListeners.add(listener);
    return () => {
        backButtonListeners.delete(listener);
    };
}

export {showVerticalBarHost, addVerticalBarBackButton, hasVerticalBarBackButton, subscribeToVerticalBarBackButtons};
