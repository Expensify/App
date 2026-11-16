import {fireEvent, render, screen} from '@testing-library/react-native';

import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

// Jest resolves the native stub, which never treats a click as modified, so the web implementation is used instead.
jest.mock('@libs/Navigation/helpers/openInternalRouteInNewTab', () => jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/openInternalRouteInNewTab/index.ts'));

const TEST_ID = 'link-pressable';

function renderLinkPressable(onPress: () => void, isDisabled = false, isInteractive = true) {
    render(
        <PressableWithFeedback
            testID={TEST_ID}
            linkRoute={ROUTES.SETTINGS}
            onPress={onPress}
            disabled={isDisabled}
            interactive={isInteractive}
            accessibilityLabel="Settings"
            role={CONST.ROLE.LINK}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
        >
            <Text>Settings</Text>
        </PressableWithFeedback>,
    );
}

describe('Pressable with linkRoute', () => {
    it('renders the route as an absolute href', () => {
        // Given a pressable linking to the settings route
        // When it renders
        renderLinkPressable(jest.fn());

        // Then the href starts at the site root, so it does not resolve against the current page's path
        expect(screen.getByTestId(TEST_ID).props.href).toBe(`/${ROUTES.SETTINGS}`);
    });

    it('navigates in the app and stops the browser from loading the href on a plain click', () => {
        // Given a pressable linking to the settings route
        const onPress = jest.fn();
        const preventDefault = jest.fn();
        renderLinkPressable(onPress);

        // When it is clicked without a modifier key
        fireEvent.press(screen.getByTestId(TEST_ID), {nativeEvent: {button: 0}, preventDefault});

        // Then the browser's page load is prevented and the in-app handler runs instead
        expect(preventDefault).toHaveBeenCalled();
        expect(onPress).toHaveBeenCalled();
    });

    it('leaves a Cmd click to the browser so the route opens in a new tab', () => {
        // Given a pressable linking to the settings route
        const onPress = jest.fn();
        const preventDefault = jest.fn();
        renderLinkPressable(onPress);

        // When it is clicked with the Cmd key held
        fireEvent.press(screen.getByTestId(TEST_ID), {nativeEvent: {button: 0, metaKey: true}, preventDefault});

        // Then the current tab does not navigate and the browser keeps its default new tab behavior
        expect(preventDefault).not.toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('leaves a Shift click to the browser so the route opens in a new window', () => {
        // Given a pressable linking to the settings route
        const onPress = jest.fn();
        const preventDefault = jest.fn();
        renderLinkPressable(onPress);

        // When it is clicked with the Shift key held
        fireEvent.press(screen.getByTestId(TEST_ID), {nativeEvent: {button: 0, shiftKey: true}, preventDefault});

        // Then the current tab does not navigate and the browser keeps its default new window behavior
        expect(preventDefault).not.toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('leaves Enter to the browser so Cmd or Ctrl reaches the click it fires', () => {
        // Given a pressable with the link role linking to the settings route
        const onPress = jest.fn();
        const preventDefault = jest.fn();
        renderLinkPressable(onPress);

        // When Enter is pressed on it
        fireEvent(screen.getByTestId(TEST_ID), 'keyDown', {key: CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey, nativeEvent: {}, preventDefault});

        // Then the key press does not navigate on its own, so the browser's click decides between this tab and a new one
        expect(preventDefault).not.toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('renders no href when not interactive', () => {
        // Given a pressable linking to the settings route that ignores presses
        // When it renders
        renderLinkPressable(jest.fn(), false, false);

        // Then there is no href, so a Cmd click cannot open a route a plain click would not
        expect(screen.getByTestId(TEST_ID).props.href).toBeUndefined();
    });

    it('renders no href when disabled', () => {
        // Given a disabled pressable linking to the settings route
        // When it renders
        renderLinkPressable(jest.fn(), true);

        // Then there is no href, so the browser context menu cannot open the route in a new tab
        expect(screen.getByTestId(TEST_ID).props.href).toBeUndefined();
    });

    it('does not follow the href when disabled', () => {
        // Given a disabled pressable linking to the settings route
        const onPress = jest.fn();
        const preventDefault = jest.fn();
        renderLinkPressable(onPress, true);

        // When it is clicked with the Ctrl key held
        fireEvent.press(screen.getByTestId(TEST_ID), {nativeEvent: {button: 0, ctrlKey: true}, preventDefault});

        // Then neither the browser nor the app navigates
        expect(preventDefault).toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });
});
