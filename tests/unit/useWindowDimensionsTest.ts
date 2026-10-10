import {act, renderHook} from '@testing-library/react-native';

import {FullScreenStateContext} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import useWindowDimensionsWithViewport from '@hooks/useWindowDimensions';
import type * as WindowDimensionsModule from '@hooks/useWindowDimensions';

import type * as BrowserModule from '@libs/Browser';

import type {ReactNode} from 'react';

import {createElement} from 'react';
// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';

const originalMatchMedia = window.matchMedia;

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof BrowserModule>('@libs/Browser'),
    isMobileWebKit: () => true,
}));

// Jest prefers index.native.ts, so load the web hook for viewport focus events.
jest.mock('@hooks/useWindowDimensions', () => jest.requireActual<typeof WindowDimensionsModule>('@hooks/useWindowDimensions/index.ts'));

describe('useWindowDimensions', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.matchMedia = jest.fn().mockReturnValue({matches: true});
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('restores the initial viewport on input blur and caches keyboard height on input focus', () => {
        // Given mobile WebKit in portrait before the keyboard reduces the window height
        const initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
        expect(initialViewportHeight).toBeGreaterThan(500);
        let viewportDimensions = {...ReactNative.Dimensions.get('window'), width: 400, height: initialViewportHeight};
        jest.spyOn(jest.requireMock<typeof ReactNative>('react-native'), 'useWindowDimensions').mockImplementation(() => viewportDimensions);
        const {result, rerender} = renderHook(() => useWindowDimensionsWithViewport(true));
        const button = document.createElement('button');
        const input = document.createElement('input');
        document.body.append(button, input);

        // When the keyboard reduces the window height, the portrait cache records it
        viewportDimensions = {...viewportDimensions, height: 500};
        rerender({});
        act(() => jest.runOnlyPendingTimers());
        expect(result.current.windowHeight).toBe(500);

        // When the input loses focus, the initial viewport height is restored
        act(() => input.dispatchEvent(new FocusEvent('focusout', {bubbles: true})));
        act(() => jest.runOnlyPendingTimers());
        expect(result.current.windowHeight).toBe(initialViewportHeight);

        // When a non-input element receives focus
        act(() => button.dispatchEvent(new FocusEvent('focusin', {bubbles: true})));
        act(() => jest.runOnlyPendingTimers());
        // Then the restored viewport height is preserved
        expect(result.current.windowHeight).toBe(initialViewportHeight);

        // When an input receives focus and the debounce completes
        act(() => input.dispatchEvent(new FocusEvent('focusin', {bubbles: true})));
        act(() => jest.runOnlyPendingTimers());
        // Then the reduced window height cached in portrait is used
        expect(result.current.windowHeight).toBe(500);
        button.remove();
        input.remove();
    });

    it('uses locked fullscreen dimensions until the lock is released', () => {
        // Given a fullscreen context with an existing dimension lock
        const lockedWindowDimensionsRef = {current: {windowWidth: 300, windowHeight: 600, responsiveLayoutResults: {}}};
        const state = {isFullScreen: true, isFullScreenRef: {current: true}, lockedWindowDimensionsRef};
        const {result, rerender} = renderHook(() => useWindowDimensionsWithViewport(), {
            wrapper: ({children}: {children: ReactNode}) => createElement(FullScreenStateContext.Provider, {value: state}, children),
        });
        // When the hook reads the lock
        // Then it uses the locked dimensions
        expect(result.current).toEqual({windowWidth: 300, windowHeight: 600});

        // When fullscreen exits while the lock is still present
        state.isFullScreen = false;
        rerender({});
        // Then the last locked dimensions remain for the transition frame
        expect(result.current).toEqual({windowWidth: 300, windowHeight: 600});
    });
});
