import {act, renderHook} from '@testing-library/react-native';

import useIsTabFocused from '@hooks/useIsTabFocused';
import useIsTabVisible from '@hooks/useIsTabVisible';

import SCREENS from '@src/SCREENS';

import type {ScaledSize} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {Dimensions} from 'react-native';

jest.mock('@hooks/useIsTabFocused', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

// Jest resolves the native helper, which treats every layout as narrow, so the web one is used to exercise both layouts.
jest.mock('@libs/getIsNarrowLayout', () => jest.requireActual<{default: () => boolean}>('@libs/getIsNarrowLayout/index.ts'));

// Landscape is covered by its own helper, so these cases are driven by width alone.
jest.mock('@libs/isInLandscapeMode', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
}));

const mockedUseIsTabFocused = jest.mocked(useIsTabFocused);
const mockedUseIsFocused = jest.mocked(useIsFocused);

const NARROW_WINDOW = {width: 400, height: 800, scale: 1, fontScale: 1};
const WIDE_WINDOW = {width: 1400, height: 900, scale: 1, fontScale: 1};

type DimensionsChangeHandler = Parameters<typeof Dimensions.addEventListener>[1];

// The preset already mocks `addEventListener`, so one of its subscriptions is kept for the spy to hand back.
const dimensionsSubscription = Dimensions.addEventListener('change', () => {});
let currentWindow: ScaledSize = WIDE_WINDOW;
const dimensionsChangeHandlers = new Set<DimensionsChangeHandler>();

/** Resizes the window and fires the change event the hook listens to. */
function resizeWindow(window: ScaledSize) {
    currentWindow = window;
    act(() => {
        for (const handler of dimensionsChangeHandlers) {
            handler({window, screen: window});
        }
    });
}

/** Renders the hook for the Home tab and counts how often it renders. */
function renderVisibility() {
    let renderCount = 0;
    const hook = renderHook(() => {
        renderCount++;
        return useIsTabVisible(SCREENS.HOME);
    });
    return {...hook, getRenderCount: () => renderCount};
}

describe('useIsTabVisible', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseIsFocused.mockReturnValue(true);
        mockedUseIsTabFocused.mockReturnValue(true);
        currentWindow = WIDE_WINDOW;
        dimensionsChangeHandlers.clear();
        jest.spyOn(Dimensions, 'get').mockImplementation(() => currentWindow);
        jest.spyOn(Dimensions, 'addEventListener').mockImplementation((_type, handler) => {
            dimensionsChangeHandlers.add(handler);
            return dimensionsSubscription;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('is true when the screen is focused', () => {
        // Given the tab root screen is focused with nothing on top of it

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is visible
        expect(result.current).toBe(true);
    });

    it('stays true under an RHP on a wide layout', () => {
        // Given a wide window and an RHP opened over the active tab, which blurs the screen but leaves it beside the pane
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen still counts as visible, so its data can load while the RHP is open
        expect(result.current).toBe(true);
    });

    it('is false under an RHP on a narrow layout', () => {
        // Given a narrow window, where an RHP covers the whole screen
        currentWindow = NARROW_WINDOW;
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is hidden, so nothing is fetched for it until the RHP closes
        expect(result.current).toBe(false);
    });

    it('is false on a wide layout when another tab is active', () => {
        // Given a wide window with another tab selected
        mockedUseIsFocused.mockReturnValue(false);
        mockedUseIsTabFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is hidden behind the other tab
        expect(result.current).toBe(false);
    });

    it('follows the window across the breakpoint', () => {
        // Given an RHP open on a wide window
        mockedUseIsFocused.mockReturnValue(false);
        const {result} = renderVisibility();

        // When the window shrinks to a narrow layout
        resizeWindow(NARROW_WINDOW);

        // Then the RHP now covers the screen, so it is hidden
        expect(result.current).toBe(false);
    });

    it('does not re-render on a resize that stays on the same side of the breakpoint', () => {
        // Given the hook rendered on a wide window
        const {getRenderCount} = renderVisibility();
        const initialRenderCount = getRenderCount();

        // When the window is resized but stays wide, as happens on every step of a drag
        resizeWindow({...WIDE_WINDOW, width: 1200});
        resizeWindow({...WIDE_WINDOW, width: 1000});

        // Then the screen does not re-render, because only the narrow flag is read
        expect(getRenderCount()).toBe(initialRenderCount);
    });
});
