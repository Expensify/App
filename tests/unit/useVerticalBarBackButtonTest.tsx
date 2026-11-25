import {render} from '@testing-library/react-native';

import ModalContext from '@components/Modal/ModalContext';

import useVerticalBarBackButton from '@hooks/useVerticalBarBackButton/index.ios';

import type {VerticalBarTabsScreen} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';
import VerticalBarTabsScreenContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {NavigationContext, NavigationRouteContext} from '@react-navigation/native';
import React, {isValidElement} from 'react';

const ROUTE = {key: 'profile-key', name: 'Profile'};

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical', () => () => true);

const OUTSIDE_MODAL = {default: true};
const INSIDE_MODAL = {default: false};

/** A navigation of a stack screen, the focused one unless told otherwise, which records the options it is given. */
function createNavigation({parent, isFocused = true}: {parent?: NavigationProp<ParamListBase>; isFocused?: boolean} = {}) {
    const setOptions = jest.fn<void, [NativeStackNavigationOptions]>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook reads only these members of a navigation.
    const navigation = {
        setOptions,
        getState: () => ({type: 'stack', index: 0, routes: [ROUTE]}),
        getParent: () => parent,
        isFocused: () => isFocused,
        addListener: () => () => {},
    } as unknown as NavigationProp<ParamListBase>;
    return {navigation, setOptions};
}

/** What the tabs give their screens, which records each back button it is told of, and each one that is gone again. */
function createTabsScreen() {
    const removeBackButton = jest.fn();
    const addBackButton = jest.fn(() => removeBackButton);
    const tabsScreen: VerticalBarTabsScreen = {addBackButton};
    return {tabsScreen, addBackButton, removeBackButton};
}

type HeaderProps = {
    screenNavigation: NavigationProp<ParamListBase>;
    /** What the tabs give their screens, for a header on a tab screen. */
    tabsScreen?: VerticalBarTabsScreen;
    isInModal?: boolean;
    goBack?: () => void;
    /** Gets what the hook returns: whether the header leaves its own back button out. */
    onRender?: (isBackButtonInVerticalBar: boolean) => void;
};

/** Stands in for a header that has a back button. */
function BackButtonOwner({goBack, onRender}: Required<Pick<HeaderProps, 'goBack' | 'onRender'>>) {
    onRender(useVerticalBarBackButton(goBack));
    return null;
}

function Header({screenNavigation, tabsScreen, isInModal = false, goBack = () => {}, onRender = () => {}}: HeaderProps) {
    return (
        <ModalContext.Provider value={isInModal ? INSIDE_MODAL : OUTSIDE_MODAL}>
            <VerticalBarTabsScreenContext.Provider value={tabsScreen}>
                <NavigationContext.Provider value={screenNavigation}>
                    <NavigationRouteContext.Provider value={ROUTE}>
                        <BackButtonOwner
                            goBack={goBack}
                            onRender={onRender}
                        />
                    </NavigationRouteContext.Provider>
                </NavigationContext.Provider>
            </VerticalBarTabsScreenContext.Provider>
        </ModalContext.Provider>
    );
}

/** Presses the back item among the options a screen was given. */
function pressBackItem(options: NativeStackNavigationOptions | undefined) {
    const item = options?.unstable_headerLeftItems?.({canGoBack: true}).at(0);
    if (item?.type === 'custom' && isValidElement<{onPress: () => void}>(item.element)) {
        item.element.props.onPress();
    }
}

describe('useVerticalBarBackButton', () => {
    it("shows the back button in a bar of the screen itself, in place of the header's own, and hides that bar once the header is gone", () => {
        // Given a header on a tab screen of a foldable iPhone, whose window has a vertical bar
        const screen = createNavigation();
        const {tabsScreen} = createTabsScreen();
        const goBack = jest.fn();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered, the button in the vertical bar is pressed and the header unmounts
        const {unmount} = render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={tabsScreen}
                goBack={goBack}
                onRender={onRender}
            />,
        );
        const shownOptions = screen.setOptions.mock.calls.at(-1)?.[0];
        pressBackItem(shownOptions);
        unmount();

        // Then the screen got a bar that UIKit shows, the header was told to leave its own button out, the press went to
        // the header's own handler, and the bar is hidden again
        expect(shownOptions?.headerShown).toBe(true);
        expect(onRender).toHaveBeenLastCalledWith(true);
        expect(goBack).toHaveBeenCalledTimes(1);
        expect(screen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(false);
    });

    it('tells the tabs about the back button of a tab screen for as long as it is shown', () => {
        // Given a header on a tab screen, whose back button takes the place of the create and scan buttons in the vertical bar
        const screen = createNavigation();
        const {tabsScreen, addBackButton, removeBackButton} = createTabsScreen();

        // When the header is rendered and then unmounts
        const {unmount} = render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={tabsScreen}
            />,
        );
        const removalsWhileMounted = removeBackButton.mock.calls.length;
        unmount();

        // Then the tabs learned of the button, so they take the create and scan buttons out, and of its end, so they put them back
        expect(addBackButton).toHaveBeenCalledTimes(1);
        expect(removalsWhileMounted).toBe(0);
        expect(removeBackButton).toHaveBeenCalledTimes(1);
    });

    it('keeps the back button of the next screen of a flow when the screen before it goes after that one has come', () => {
        // Given two screens of a flow presented over the tabs, which share the bar of the root stack's screen
        const rootScreen = createNavigation();
        const firstScreen = createNavigation({parent: rootScreen.navigation});
        const secondScreen = createNavigation({parent: rootScreen.navigation});
        const firstHeader = render(<Header screenNavigation={firstScreen.navigation} />);

        // When the header of the second screen puts its button in the bar before the header of the first one is gone
        render(<Header screenNavigation={secondScreen.navigation} />);
        firstHeader.unmount();

        // Then the bar is still shown with the button of the second screen, which would have no back button otherwise
        expect(rootScreen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(true);
    });

    it('adds no back button for a tab screen that is not the one shown, whose header leaves its own out all the same', () => {
        // Given a header on a tab screen that stays mounted while another screen is shown
        const screen = createNavigation({isFocused: false});
        const {tabsScreen, addBackButton} = createTabsScreen();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={tabsScreen}
                onRender={onRender}
            />,
        );

        // Then the vertical bar keeps the items of the screen that is shown, and the header has no button of its own
        // either, so none appears on it while the screen slides in or out
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(addBackButton).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenLastCalledWith(true);
    });

    it('adds no back button for a header inside a modal, which keeps its own', () => {
        // Given a header rendered in a modal, which covers the screen and the bars of the screen under it
        const screen = createNavigation();
        const {tabsScreen} = createTabsScreen();
        const onRender = jest.fn<void, [boolean]>();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={tabsScreen}
                isInModal
                onRender={onRender}
            />,
        );

        // Then the screen gets no bar, because a button in the bar under the modal could not be reached, and the header
        // keeps its own button
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(onRender).toHaveBeenLastCalledWith(false);
    });

    it('shows the back button in the bar of the root stack screen for a screen presented over the tabs', () => {
        // Given a header on a screen of a flow presented over the tabs, in a stack nested in a screen of the root stack
        const rootScreen = createNavigation();
        const screen = createNavigation({parent: rootScreen.navigation});

        // When the header is rendered
        render(<Header screenNavigation={screen.navigation} />);

        // Then the button is in the bar of the root stack's screen, the only one of the flow that reaches the edge the
        // vertical bar is on, and the nested screen's own bar stays untouched
        expect(rootScreen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(true);
        expect(rootScreen.setOptions.mock.calls.at(-1)?.[0].unstable_headerLeftItems).toBeDefined();
        expect(screen.setOptions).not.toHaveBeenCalled();
    });
});
