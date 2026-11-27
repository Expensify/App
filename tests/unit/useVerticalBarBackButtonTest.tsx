import {render} from '@testing-library/react-native';

import ModalContext from '@components/Modal/ModalContext';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useVerticalBarBackButton from '@hooks/useVerticalBarBackButton/index.ios';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {NavigationContext} from '@react-navigation/native';
import React, {isValidElement} from 'react';

jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical', () => () => true);
// The button is only pressed here, through the item it is in, so what it draws is left out.
jest.mock('@components/VerticalBarBackButton', () => () => null);

const OUTSIDE_MODAL = {default: true};
const INSIDE_MODAL = {default: false};

/** A navigation of a screen, the focused one unless told otherwise, which records the options it is given. */
function createNavigation({parent, isFocused: isFocusedAtFirst = true}: {parent?: NavigationProp<ParamListBase>; isFocused?: boolean} = {}) {
    const setOptions = jest.fn<void, [NativeStackNavigationOptions]>();
    const listeners = new Set<() => void>();
    let isFocused = isFocusedAtFirst;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook reads only these members of a navigation.
    const navigation = {
        setOptions,
        getParent: () => parent,
        // A screen is focused only while every screen it is nested in is too.
        isFocused: () => isFocused && (parent?.isFocused() ?? true),
        addListener: (_: string, listener: () => void) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    } as unknown as NavigationProp<ParamListBase>;
    /** The options the screen has after every call so far, merged as React Navigation merges them. */
    const getOptions = () => {
        const mergedOptions: NativeStackNavigationOptions = {};
        for (const [options] of setOptions.mock.calls) {
            Object.assign(mergedOptions, options);
        }
        return mergedOptions;
    };
    /** Changes whether the screen is the focused one, as a change of its navigator's state does. */
    const setIsFocused = (isFocusedNow: boolean) => {
        isFocused = isFocusedNow;
    };
    /** Tells the listeners of the screen that its focus has changed, as its navigator does, with no render of the screen. */
    const emitFocusChange = () => {
        for (const listener of listeners) {
            listener();
        }
    };
    return {navigation, setOptions, getOptions, setIsFocused, emitFocusChange};
}

type Screen = ReturnType<typeof createNavigation>;

/** Moves the focus from one screen to another. The state changes for both at once, and the navigator tells of it after that. */
function moveFocus(from: Screen, to?: Screen) {
    from.setIsFocused(false);
    to?.setIsFocused(true);
    from.emitFocusChange();
    to?.emitFocusChange();
}

type HeaderProps = {
    screenNavigation: NavigationProp<ParamListBase>;
    isInModal?: boolean;
    isInSidePanel?: boolean;
    goBack?: () => void;
    /** Gets what the hook returns: whether the header leaves its own back button out. */
    onRender?: (isBackButtonInVerticalBar: boolean) => void;
};

/** Stands in for a header that has a back button. */
function BackButtonOwner({goBack, onRender}: Required<Pick<HeaderProps, 'goBack' | 'onRender'>>) {
    onRender(useVerticalBarBackButton(goBack));
    return null;
}

function Header({screenNavigation, isInModal = false, isInSidePanel = false, goBack = () => {}, onRender = () => {}}: HeaderProps) {
    return (
        <ModalContext.Provider value={isInModal ? INSIDE_MODAL : OUTSIDE_MODAL}>
            <IsInSidePanelContext.Provider value={isInSidePanel}>
                <NavigationContext.Provider value={screenNavigation}>
                    <BackButtonOwner
                        goBack={goBack}
                        onRender={onRender}
                    />
                </NavigationContext.Provider>
            </IsInSidePanelContext.Provider>
        </ModalContext.Provider>
    );
}

/** The back item among the options of a screen. */
function getBackItem(options: NativeStackNavigationOptions) {
    return options.unstable_headerLeftItems?.({canGoBack: true}).at(0);
}

/** Presses the back item among the options of a screen. */
function pressBackItem(options: NativeStackNavigationOptions) {
    const item = getBackItem(options);
    if (item?.type === 'custom' && isValidElement<{onPress: () => void}>(item.element)) {
        item.element.props.onPress();
    }
}

describe('useVerticalBarBackButton', () => {
    it("shows the back button in the bar of the root stack screen, in place of the header's own, and hides that bar once the header is gone", () => {
        // Given a header on a screen in a stack nested in a screen of the root stack, on a foldable iPhone whose window has a vertical bar
        const rootScreen = createNavigation();
        const screen = createNavigation({parent: rootScreen.navigation});
        const goBack = jest.fn();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered, the button in the vertical bar is pressed and the header unmounts
        const {unmount} = render(
            <Header
                screenNavigation={screen.navigation}
                goBack={goBack}
                onRender={onRender}
            />,
        );
        const shownOptions = rootScreen.getOptions();
        pressBackItem(shownOptions);
        unmount();

        // Then the root stack's screen, the only one whose bar reaches the edge the vertical bar is on, got a bar that
        // UIKit shows, the header was told to leave its own button out, the press went to the header's own handler, and
        // the bar is hidden again with no button
        expect(shownOptions.headerShown).toBe(true);
        expect(getBackItem(shownOptions)).toBeDefined();
        expect(onRender).toHaveBeenLastCalledWith(true);
        expect(goBack).toHaveBeenCalledTimes(1);
        expect(rootScreen.getOptions().headerShown).toBe(false);
        expect(rootScreen.getOptions().unstable_headerLeftItems).toBeUndefined();
        expect(screen.setOptions).not.toHaveBeenCalled();
    });

    it('keeps the same button in the bar from one screen to the next and back, and hands the press over to the screen that is shown', () => {
        // Given two screens inside one screen of the root stack, each with a header that has a back button, the first of
        // which is shown
        const rootScreen = createNavigation();
        const firstScreen = createNavigation({parent: rootScreen.navigation});
        const secondScreen = createNavigation({parent: rootScreen.navigation, isFocused: false});
        const goBackFromFirst = jest.fn();
        const goBackFromSecond = jest.fn();
        render(
            <Header
                screenNavigation={firstScreen.navigation}
                goBack={goBackFromFirst}
            />,
        );
        const itemOfFirstScreen = getBackItem(rootScreen.getOptions());

        // When the second screen is pushed, whose header mounts before the navigator tells of the change, and the button
        // is pressed, and then that screen is closed and the button is pressed again. The first screen is frozen while it
        // is covered, so it renders nothing when it is uncovered, and only its navigator tells of the change
        firstScreen.setIsFocused(false);
        secondScreen.setIsFocused(true);
        const secondHeader = render(
            <Header
                screenNavigation={secondScreen.navigation}
                goBack={goBackFromSecond}
            />,
        );
        firstScreen.emitFocusChange();
        pressBackItem(rootScreen.getOptions());
        const pressesOnSecondScreen = [goBackFromFirst.mock.calls.length, goBackFromSecond.mock.calls.length];
        moveFocus(secondScreen, firstScreen);
        pressBackItem(rootScreen.getOptions());
        secondHeader.unmount();

        // Then the bar always had the item it had at first, and the item was set only once, so UIKit left the button in
        // place the whole time, and each press went back from the screen that was shown
        expect(getBackItem(rootScreen.getOptions())).toBe(itemOfFirstScreen);
        expect(rootScreen.setOptions.mock.calls.filter(([options]) => 'unstable_headerLeftItems' in options)).toHaveLength(1);
        expect(rootScreen.setOptions).not.toHaveBeenCalledWith(expect.objectContaining({headerShown: false}));
        expect(pressesOnSecondScreen).toEqual([0, 1]);
        expect(goBackFromFirst).toHaveBeenCalledTimes(1);
        expect(goBackFromSecond).toHaveBeenCalledTimes(1);
    });

    it('takes the button out once the screen of its header is no longer shown, while the header leaves its own out all the same', () => {
        // Given a header on a tab screen, which stays mounted while another tab is shown
        const rootScreen = createNavigation();
        const screen = createNavigation({parent: rootScreen.navigation});
        const onRender = jest.fn<void, [boolean]>();
        render(
            <Header
                screenNavigation={screen.navigation}
                onRender={onRender}
            />,
        );

        // When another screen without a back button takes its place
        moveFocus(screen);

        // Then the vertical bar has no back button, and the header that is no longer shown has none of its own either,
        // so none appears on it while it slides in or out
        expect(getBackItem(rootScreen.getOptions())).toBeUndefined();
        expect(rootScreen.getOptions().headerShown).toBe(false);
        expect(onRender).toHaveBeenLastCalledWith(true);
    });

    it('keeps the back button while another screen of the root stack covers the one it is in', () => {
        // Given a header on a screen that is shown, with its back button in the bar of its root stack screen
        const rootScreen = createNavigation();
        const screen = createNavigation({parent: rootScreen.navigation});
        render(<Header screenNavigation={screen.navigation} />);
        const itemBeforeCover = getBackItem(rootScreen.getOptions());

        // When another screen of the root stack, which has a bar of its own, covers that root stack screen
        moveFocus(rootScreen);
        screen.emitFocusChange();

        // Then the button stays in the bar, untouched, so it is there already when the screen is uncovered
        expect(getBackItem(rootScreen.getOptions())).toBe(itemBeforeCover);
        expect(rootScreen.setOptions.mock.calls.filter(([options]) => 'unstable_headerLeftItems' in options)).toHaveLength(1);
    });

    it('adds no back button for a header inside a modal, which keeps its own', () => {
        // Given a header rendered in a modal, which covers the screen and the bars of the screen under it
        const screen = createNavigation();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                isInModal
                onRender={onRender}
            />,
        );

        // Then the screen gets no bar, because a button in the bar under the modal could not be reached, and the header
        // keeps its own button
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenLastCalledWith(false);
    });

    it('adds no back button for a header inside the side panel, which keeps its own', () => {
        // Given a header rendered in the side panel, which sits beside the screen and is not a screen with a bar itself
        const screen = createNavigation();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                isInSidePanel
                onRender={onRender}
            />,
        );

        // Then the screen gets no bar, because its back button would go back on the screen and not in the side panel,
        // and the header keeps its own button
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenLastCalledWith(false);
    });
});
