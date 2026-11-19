import {act, renderHook} from '@testing-library/react-native';

import useBlockedBrowserBackHandler from '@hooks/useBlockedBrowserBackHandler';

import recordBlockedNavigation from '@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Jest resolves the native no-op variant, so use the web one that reports a blocked browser back press.
jest.mock('@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation', () =>
    jest.requireActual<Record<string, unknown>>('@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation/index.web'),
);

/** A focused screen, which is all useFocusEffect needs to subscribe. */
const focusedNavigation = createMock<NavigationProp<ParamListBase>>({
    isFocused: () => true,
    addListener: () => () => {},
});

function FocusedScreen({children}: {children: React.ReactNode}) {
    return <NavigationContext.Provider value={focusedNavigation}>{children}</NavigationContext.Provider>;
}

describe('useBlockedBrowserBackHandler', () => {
    it('should run the latest callback when the screen re-renders right after a blocked browser back press', async () => {
        // Given a focused screen handles blocked browser back presses
        const firstCallback = jest.fn();
        const latestCallback = jest.fn();
        const {rerender, unmount} = renderHook(({callback}: {callback: () => void}) => useBlockedBrowserBackHandler(callback), {
            initialProps: {callback: firstCallback},
            wrapper: FocusedScreen,
        });

        // When the router blocks a browser back press and the screen re-renders before the press is handled
        act(() => {
            recordBlockedNavigation();
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        rerender({callback: latestCallback});
        await act(waitForBatchedUpdates);

        // Then the press is still handled once, with the callback from the latest render
        expect(latestCallback).toHaveBeenCalledTimes(1);
        expect(firstCallback).not.toHaveBeenCalled();

        unmount();
    });
});
