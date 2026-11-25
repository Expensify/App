import {render} from '@testing-library/react-native';

import ModalContext from '@components/Modal/ModalContext';

import useVerticalBarBackButton from '@hooks/useVerticalBarBackButton/index.ios';

import type {VerticalBarTabsScreen} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';
import VerticalBarTabsScreenContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarTabsScreenContext';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {NavigationContext, NavigationRouteContext} from '@react-navigation/native';
import React from 'react';

const ROUTE = {key: 'profile-key', name: 'Profile'};
let mockWindow = {windowWidth: 951, windowHeight: 669};

jest.mock('@hooks/useWindowDimensions', () => () => mockWindow);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical', () => () => true);

const OUTSIDE_MODAL = {default: true};
const INSIDE_MODAL = {default: false};

/** A navigation of a stack screen that is the focused one, which records the options it is given. */
function createNavigation(parent?: NavigationProp<ParamListBase>) {
    const setOptions = jest.fn<void, [NativeStackNavigationOptions]>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The hook reads only these members of a navigation.
    const navigation = {
        setOptions,
        getState: () => ({type: 'stack', index: 0, routes: [ROUTE]}),
        getParent: () => parent,
        isFocused: () => true,
        addListener: () => () => {},
    } as unknown as NavigationProp<ParamListBase>;
    return {navigation, setOptions};
}

type HeaderProps = {
    screenNavigation: NavigationProp<ParamListBase>;
    /** The screen that holds the tabs, for a header on a tab screen. */
    tabsScreen?: VerticalBarTabsScreen;
    isInModal?: boolean;
    goBack?: () => void;
};

/** Stands in for a header that has a back button. */
function BackButtonOwner({goBack}: Required<Pick<HeaderProps, 'goBack'>>) {
    useVerticalBarBackButton(goBack);
    return null;
}

function Header({screenNavigation, tabsScreen, isInModal = false, goBack = () => {}}: HeaderProps) {
    return (
        <ModalContext.Provider value={isInModal ? INSIDE_MODAL : OUTSIDE_MODAL}>
            <VerticalBarTabsScreenContext.Provider value={tabsScreen}>
                <NavigationContext.Provider value={screenNavigation}>
                    <NavigationRouteContext.Provider value={ROUTE}>
                        <BackButtonOwner goBack={goBack} />
                    </NavigationRouteContext.Provider>
                </NavigationContext.Provider>
            </VerticalBarTabsScreenContext.Provider>
        </ModalContext.Provider>
    );
}

/** Presses the back item among the options a screen was given. */
function pressBackItem(options: NativeStackNavigationOptions | undefined) {
    const item = options?.unstable_headerLeftItems?.({canGoBack: true}).at(0);
    if (item?.type === 'button') {
        item.onPress();
    }
}

describe('useVerticalBarBackButton', () => {
    beforeEach(() => {
        mockWindow = {windowWidth: 951, windowHeight: 669};
    });

    it('shows the back button in a bar of the screen itself and hides that bar once the header is gone', () => {
        // Given a header on a tab screen of the iPhone Duo folded in portrait, whose cover panel is 466 by 678, while the
        // tab bar is hidden and the bar of the tabs screen has no items
        mockWindow = {windowWidth: 466, windowHeight: 678};
        const screen = createNavigation();
        const tabsScreen = createNavigation();
        const goBack = jest.fn();

        // When the header is rendered, the button in the vertical bar is pressed and the header unmounts
        const {unmount} = render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={{navigation: tabsScreen.navigation, hasBarItems: false}}
                goBack={goBack}
            />,
        );
        const shownOptions = screen.setOptions.mock.calls.at(-1)?.[0];
        pressBackItem(shownOptions);
        unmount();

        // Then the screen got a bar that UIKit shows, the press went to the header's own handler, and the bar is hidden again
        expect(shownOptions?.headerShown).toBe(true);
        expect(goBack).toHaveBeenCalledTimes(1);
        expect(screen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(false);
        expect(tabsScreen.setOptions).not.toHaveBeenCalled();
    });

    it('adds the back button to the bar of the tabs screen while that bar has the create and scan buttons', () => {
        // Given a tab screen that is on screen while the tab bar is shown, so the tabs screen offers its bar
        const screen = createNavigation();
        const tabsScreen = createNavigation();

        // When the header is rendered and then unmounts
        const {unmount} = render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={{navigation: tabsScreen.navigation, hasBarItems: true}}
            />,
        );
        const optionsWhileMounted = tabsScreen.setOptions.mock.calls.at(-1)?.[0];
        unmount();
        const optionsAfterUnmount = tabsScreen.setOptions.mock.calls.at(-1)?.[0];

        // Then the button went to the tabs screen's bar, where UIKit puts it over the other items, the screen's own bar
        // stayed untouched, and only the button was taken away, as that bar still belongs to the create and scan buttons
        expect(optionsWhileMounted?.unstable_headerLeftItems).toBeDefined();
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(Object.keys(optionsAfterUnmount ?? {})).toEqual(['unstable_headerLeftItems']);
        expect(optionsAfterUnmount?.unstable_headerLeftItems).toBeUndefined();
    });

    it('adds no back button on a phone folded in landscape while the tab bar is shown', () => {
        // Given the cover panel of the iPhone Duo in landscape, whose 466pt bar has room for one item above the tab
        // column, and that item is the create button
        mockWindow = {windowWidth: 678, windowHeight: 466};
        const screen = createNavigation();
        const tabsScreen = createNavigation();

        // When the header of a tab screen is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={{navigation: tabsScreen.navigation, hasBarItems: true}}
            />,
        );

        // Then neither bar gets the button, because UIKit would draw it or the other item over the tab column
        expect(screen.setOptions).not.toHaveBeenCalled();
        expect(tabsScreen.setOptions).not.toHaveBeenCalled();
    });

    it('shows the back button on a phone folded in landscape once the tab bar is hidden', () => {
        // Given the cover panel of the iPhone Duo in landscape, on a tab screen that hides the tab bar, so the vertical
        // bar has no other item
        mockWindow = {windowWidth: 678, windowHeight: 466};
        const screen = createNavigation();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={{navigation: createNavigation().navigation, hasBarItems: false}}
            />,
        );

        // Then the screen's own bar shows the button, the only item in the vertical bar
        expect(screen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(true);
    });

    it('adds no back button for a header inside a modal', () => {
        // Given a header rendered in a modal, which covers the screen and the bars of the screen under it
        const screen = createNavigation();

        // When the header is rendered
        render(
            <Header
                screenNavigation={screen.navigation}
                tabsScreen={{navigation: createNavigation().navigation, hasBarItems: false}}
                isInModal
            />,
        );

        // Then the screen gets no bar, because a button in the bar under the modal could not be reached
        expect(screen.setOptions).not.toHaveBeenCalled();
    });

    it('shows the back button in the bar of the root stack screen for a screen presented over the tabs', () => {
        // Given a header on a screen of a flow presented over the tabs, in a stack nested in a screen of the root stack
        const rootScreen = createNavigation();
        const screen = createNavigation(rootScreen.navigation);

        // When the header is rendered
        render(<Header screenNavigation={screen.navigation} />);

        // Then the button is in the bar of the root stack's screen, the only one of the flow that reaches the edge the
        // vertical bar is on, and the nested screen's own bar stays untouched
        expect(rootScreen.setOptions.mock.calls.at(-1)?.[0].headerShown).toBe(true);
        expect(rootScreen.setOptions.mock.calls.at(-1)?.[0].unstable_headerLeftItems).toBeDefined();
        expect(screen.setOptions).not.toHaveBeenCalled();
    });
});
