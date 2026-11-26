/**
 * The native bar of a screen as the host of what the screen shows in the vertical bar of a foldable iPhone. UIKit lays
 * the items of a navigation bar out in that bar, next to the status items and the tab bar, and only does so for a bar
 * that is shown. The create and scan buttons and the back button share the bar of one screen, so the bar is shown for as
 * long as any of them is in it, and the back button stays the same item while one screen after another uses it.
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

type VerticalBar = {
    /** The headers that may have the back button, in the order they came. */
    backButtonOwners: BackButtonOwner[];

    /** The item of the back button, the same one for as long as the bar exists, so UIKit keeps it in place between two screens. */
    backButtonItem: NativeStackHeaderItem;

    /** The create and scan buttons, while the screen has them. */
    actionItems?: NativeStackHeaderItem[];

    /** Whether the bar has the back button now. */
    hasBackButton: boolean;

    /** The items on the right of the bar now. */
    rightItems?: NativeStackHeaderItem[];
};

/** The vertical bar items of each bar, by the navigation of the screen the bar belongs to. */
const verticalBars = new WeakMap<ScreenNavigation, VerticalBar>();

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
function getShownOwner(bar: VerticalBar): BackButtonOwner | undefined {
    return bar.backButtonOwners.findLast((owner) => owner.isShown);
}

function getVerticalBar(barNavigation: ScreenNavigation): VerticalBar {
    const existingBar = verticalBars.get(barNavigation);
    if (existingBar) {
        return existingBar;
    }
    const bar: VerticalBar = {
        backButtonOwners: [],
        // The button brings its own glass, as the create and scan buttons do, so UIKit adds none behind it.
        backButtonItem: {type: 'custom', element: createElement(VerticalBarBackButton, {onPress: () => getShownOwner(bar)?.onPress()}), hidesSharedBackground: true},
        hasBackButton: false,
    };
    verticalBars.set(barNavigation, bar);
    return bar;
}

/**
 * Sets the items of the bar and shows the bar while it has any.
 *
 * The back button is in the bar while the screen of one of its headers is shown. A screen is shown while it is the one
 * on screen in the screen of the root stack it is part of: it and every navigator between the two are the focused ones,
 * which a screen in a tab that is not selected is not. That root screen has its bar to itself, so it makes no difference
 * whether another one covers it, and the button stays in its bar for when the screen is uncovered. A navigation only
 * tells whether its screen is focused all the way up, so while the root screen is covered, what was found last still
 * holds.
 */
function updateVerticalBar(barNavigation: ScreenNavigation) {
    const bar = getVerticalBar(barNavigation);
    if (barNavigation.isFocused()) {
        for (const owner of bar.backButtonOwners) {
            owner.isShown = owner.screenNavigation.isFocused();
        }
    }
    const hasBackButton = !!getShownOwner(bar);
    // The back button takes the place of the create and scan buttons, as a screen it is on has no use for them.
    const rightItems = hasBackButton ? undefined : bar.actionItems;
    // Items that are set again are laid out again, so the options only change with what the bar holds.
    if (hasBackButton === bar.hasBackButton && rightItems === bar.rightItems) {
        return;
    }
    bar.hasBackButton = hasBackButton;
    bar.rightItems = rightItems;
    const isShown = hasBackButton || !!rightItems;
    // With no title the bar has nothing to draw along the top, and a transparent one takes no room from the screen. The
    // native back button would pop the screen itself and skip what a header does on a press.
    barNavigation.setOptions({
        headerShown: isShown,
        headerTransparent: isShown || undefined,
        headerBackVisible: isShown ? false : undefined,
        title: isShown ? '' : undefined,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        unstable_headerLeftItems: hasBackButton ? () => [bar.backButtonItem] : undefined,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        unstable_headerRightItems: rightItems ? () => rightItems : undefined,
    });
}

/**
 * Gives the create and scan buttons to the bar of a screen, or takes them away with undefined. They are left out while
 * the bar has a back button.
 */
function setVerticalBarActionItems(barNavigation: ScreenNavigation, actionItems: NativeStackHeaderItem[] | undefined) {
    getVerticalBar(barNavigation).actionItems = actionItems;
    updateVerticalBar(barNavigation);
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
    const bar = getVerticalBar(barNavigation);
    const owner: BackButtonOwner = {screenNavigation, onPress, isShown: false};
    const update = () => updateVerticalBar(barNavigation);
    // A navigator tells its own screens about focus, so a change further up is heard there.
    const unsubscribes: Array<() => void> = [];
    for (let current: ScreenNavigation | undefined = screenNavigation; current; current = current.getParent()) {
        unsubscribes.push(current.addListener('focus', update), current.addListener('blur', update));
    }
    bar.backButtonOwners.push(owner);
    update();
    return () => {
        for (const unsubscribe of unsubscribes) {
            unsubscribe();
        }
        bar.backButtonOwners.splice(bar.backButtonOwners.indexOf(owner), 1);
        update();
    };
}

export {setVerticalBarActionItems, addVerticalBarBackButton};
