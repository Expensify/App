/** Exercises viewport caching and fullscreen locks through the production hook with controlled browser inputs. */
import {act, renderHook} from '@testing-library/react-native';

import {FullScreenActionsContext, FullScreenStateContext} from '@components/VideoPlayerContexts/FullScreenContextProvider';
import type {FullScreenActionsContextType, FullScreenStateContextType, ResponsiveLayoutProperties} from '@components/VideoPlayerContexts/FullScreenContextProvider/types';

import type * as WindowDimensionsModule from '@hooks/useWindowDimensions/index';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {ScaledSize} from 'react-native';
import type ReactNative from 'react-native';

import React from 'react';
import {Dimensions} from 'react-native';

import createMock from '../utils/createMock';

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
const initialHeight = window.visualViewport?.height ?? window.innerHeight;
let mockViewport: ScaledSize = {width: 390, height: initialHeight, scale: 1, fontScale: 1};
let mockIsWebKit = true;
jest.mock('@libs/Browser', () => ({isMobile: () => true, isMobileWebKit: () => mockIsWebKit}));

const ReactNativeRuntime = jest.requireMock<typeof ReactNative>('react-native');
const useWindowDimensions = jest.requireActual<typeof WindowDimensionsModule>('@hooks/useWindowDimensions/index.ts').default;

/** Mirrors the production provider's ref mutations so render-time lock ordering remains observable. */
function createFullscreenContexts(isFullScreen: boolean) {
    const state: FullScreenStateContextType = {isFullScreen, isFullScreenRef: {current: isFullScreen}, lockedWindowDimensionsRef: {current: null}};
    const lock = jest.fn<void, [ResponsiveLayoutProperties]>((dimensions) => {
        state.lockedWindowDimensionsRef.current = dimensions;
    });
    const unlock = jest.fn<void, []>(() => {
        state.lockedWindowDimensionsRef.current = null;
    });
    const actions: FullScreenActionsContextType = {lockWindowDimensions: lock, unlockWindowDimensions: unlock, setIsFullScreen: jest.fn<void, [boolean]>()};
    function Wrapper({children}: PropsWithChildren) {
        return (
            <FullScreenStateContext.Provider value={state}>
                <FullScreenActionsContext.Provider value={actions}>{children}</FullScreenActionsContext.Provider>
            </FullScreenStateContext.Provider>
        );
    }
    return {state, lock, unlock, Wrapper};
}

function settleResize() {
    act(() => {
        jest.advanceTimersByTime(CONST.TIMING.RESIZE_DEBOUNCE_TIME);
    });
}

beforeEach(() => {
    mockViewport = {width: 390, height: initialHeight, scale: 1, fontScale: 1};
    mockIsWebKit = true;
    jest.useFakeTimers();
    jest.spyOn(ReactNativeRuntime, 'useWindowDimensions').mockImplementation(() => mockViewport);
    // Keep the physical screen above the height breakpoint so width expectations do not depend on the browser environment.
    jest.spyOn(Dimensions, 'get').mockReturnValue({width: 390, height: 900, scale: 1, fontScale: 1});
    Object.defineProperty(window, 'matchMedia', {configurable: true, writable: true, value: jest.fn<MediaQueryList, [string]>(() => createMock<MediaQueryList>({matches: true}))});
});
afterEach(() => {
    jest.restoreAllMocks();
    if (originalMatchMedia) {
        Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    } else {
        Reflect.deleteProperty(window, 'matchMedia');
    }
    jest.useRealTimers();
});

describe('useWindowDimensions', () => {
    it.each(['input', 'textarea'])('restores cached keyboard and initial heights for %s with debounce', (tagName) => {
        // Given a portrait WebKit viewport, the keyboard height must survive a later resize.
        const input = document.createElement(tagName);
        document.body.appendChild(input);
        const {result, rerender} = renderHook(() => useWindowDimensions(true));
        mockViewport = {...mockViewport, height: initialHeight - 200};
        rerender(undefined);
        expect(result.current.windowHeight).toBe(initialHeight);
        settleResize();
        expect(result.current.windowHeight).toBe(initialHeight - 200);
        mockViewport = {...mockViewport, height: initialHeight};
        rerender(undefined);
        settleResize();
        expect(result.current.windowHeight).toBe(initialHeight);
        // When focus reopens the keyboard, the saved height is used only after the debounce interval.
        act(() => {
            input.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });
        expect(result.current.windowHeight).toBe(initialHeight);
        settleResize();
        expect(result.current.windowHeight).toBe(initialHeight - 200);
        act(() => {
            input.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        });
        // Then focusout restores the original viewport rather than the keyboard measurement.
        expect(result.current.windowHeight).toBe(initialHeight - 200);
        settleResize();
        expect(result.current.windowHeight).toBe(initialHeight);
        input.remove();
    });

    it('ignores non-input, non-element and null focus targets and cleans up exact listeners', () => {
        // Given a reduced viewport, unrelated focus events must not restore the initial height.
        const addListener = jest.spyOn(window, 'addEventListener');
        const removeListener = jest.spyOn(window, 'removeEventListener');
        const {result, rerender, unmount} = renderHook(() => useWindowDimensions(true));
        mockViewport = {...mockViewport, height: initialHeight - 180};
        rerender(undefined);
        settleResize();
        const focusIn = addListener.mock.calls.find(([name]) => name === 'focusin');
        const focusOut = addListener.mock.calls.find(([name]) => name === 'focusout');
        expect(focusIn).toBeDefined();
        expect(focusOut).toBeDefined();
        if (!focusIn || !focusOut || typeof focusIn[1] !== 'function' || typeof focusOut[1] !== 'function') {
            throw new Error('Cached viewport listeners must be installed');
        }
        const notifyFocusIn = focusIn[1];
        const notifyFocusOut = focusOut[1];
        const nonInput = document.createElement('button');
        const text = document.createTextNode('text');
        document.body.append(nonInput, text);
        // When focus moves outside keyboard-producing elements, including an event without a target, no cache update applies.
        act(() => {
            nonInput.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
            text.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            text.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
            notifyFocusIn(new FocusEvent('focusin'));
            notifyFocusOut(new FocusEvent('focusout'));
        });
        settleResize();
        // Then the keyboard height remains and unmount removes the same listeners.
        expect(result.current.windowHeight).toBe(initialHeight - 180);
        unmount();
        expect(removeListener).toHaveBeenCalledWith('focusin', notifyFocusIn);
        expect(removeListener).toHaveBeenCalledWith('focusout', notifyFocusOut);
        nonInput.remove();
        text.remove();
    });

    it.each([
        {useCache: false, isWebKit: true},
        {useCache: true, isWebKit: false},
    ])('returns live dimensions without keyboard caching: %j', ({useCache, isWebKit}) => {
        // Given an uncached platform, viewport changes should be visible immediately.
        mockIsWebKit = isWebKit;
        const addListener = jest.spyOn(window, 'addEventListener');
        const {result, rerender} = renderHook(() => useWindowDimensions(useCache));
        // When the platform reports a smaller viewport, no debounced height substitutes for it.
        mockViewport = {...mockViewport, width: 800, height: 400};
        rerender(undefined);
        // Then the actual dimensions are returned and no keyboard listeners were registered.
        expect(result.current).toMatchObject({windowWidth: 800, windowHeight: 400});
        expect(addListener.mock.calls.filter(([name]) => name === 'focusin' || name === 'focusout')).toHaveLength(0);
    });

    it.each([
        {
            width: variables.extraSmallMobileResponsiveWidthBreakpoint,
            expectedResponsiveLayout: {
                isSmallScreenWidth: true,
                isExtraSmallScreenHeight: false,
                isExtraSmallScreenWidth: true,
                isMediumScreenWidth: false,
                isLargeScreenWidth: false,
                isSmallScreen: true,
            },
        },
        {
            width: variables.mobileResponsiveWidthBreakpoint,
            expectedResponsiveLayout: {
                isSmallScreenWidth: true,
                isExtraSmallScreenHeight: false,
                isExtraSmallScreenWidth: false,
                isMediumScreenWidth: false,
                isLargeScreenWidth: false,
                isSmallScreen: true,
            },
        },
        {
            width: variables.mobileResponsiveWidthBreakpoint + 1,
            expectedResponsiveLayout: {
                isSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraSmallScreenWidth: false,
                isMediumScreenWidth: true,
                isLargeScreenWidth: false,
                isSmallScreen: false,
            },
        },
        {
            width: variables.tabletResponsiveWidthBreakpoint,
            expectedResponsiveLayout: {
                isSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraSmallScreenWidth: false,
                isMediumScreenWidth: true,
                isLargeScreenWidth: false,
                isSmallScreen: false,
            },
        },
        {
            width: variables.tabletResponsiveWidthBreakpoint + 1,
            expectedResponsiveLayout: {
                isSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraSmallScreenWidth: false,
                isMediumScreenWidth: false,
                isLargeScreenWidth: true,
                isSmallScreen: false,
            },
        },
    ])('keeps responsive width thresholds at $width', ({width, expectedResponsiveLayout}) => {
        // Given a breakpoint-adjacent viewport, equality belongs to the smaller width category.
        mockViewport = {...mockViewport, width, height: 900};
        const fullscreen = createFullscreenContexts(true);
        // When fullscreen begins, the hook sends the same computed layout to the provider.
        const {result} = renderHook(() => useWindowDimensions(), {wrapper: fullscreen.Wrapper});
        // Then the lock carries responsive results, including screen-height and lower-dimension semantics.
        expect(fullscreen.lock).toHaveBeenCalledTimes(1);
        expect(fullscreen.lock).toHaveBeenCalledWith({
            windowWidth: width,
            windowHeight: 900,
            responsiveLayoutResults: expectedResponsiveLayout,
        });
        expect(result.current).toMatchObject({windowWidth: width, windowHeight: 900});
    });

    it('locks initially, locks again on orientation change and returns the last lock before unlocking', () => {
        // Given fullscreen on a phone, browser chrome changes must not replace the saved dimensions.
        mockViewport = {...mockViewport, width: 390, height: 800};
        const fullscreen = createFullscreenContexts(true);
        const {result, rerender} = renderHook(() => useWindowDimensions(), {wrapper: fullscreen.Wrapper});
        expect(fullscreen.lock).toHaveBeenCalledTimes(1);
        mockViewport = {...mockViewport, height: 700};
        rerender(undefined);
        expect(result.current).toEqual({windowWidth: 390, windowHeight: 800});
        expect(fullscreen.lock).toHaveBeenCalledTimes(1);
        // When width and height exchange their responsive orientation, the current dimensions become the next lock.
        mockViewport = {...mockViewport, width: 800, height: 390};
        rerender(undefined);
        expect(fullscreen.lock).toHaveBeenCalledTimes(2);
        expect(result.current).toMatchObject({windowWidth: 800, windowHeight: 390});
        fullscreen.state.isFullScreen = false;
        mockViewport = {...mockViewport, width: 780};
        rerender(undefined);
        // Then exit returns the last locked dimensions once before subsequent renders resume live values.
        expect(fullscreen.unlock).toHaveBeenCalledTimes(1);
        expect(result.current).toEqual({windowWidth: 800, windowHeight: 390});
        expect(fullscreen.state.lockedWindowDimensionsRef.current).toBeNull();
        rerender(undefined);
        expect(result.current).toMatchObject({windowWidth: 780, windowHeight: 390});
    });
});
