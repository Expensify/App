import {act, renderHook} from '@testing-library/react-native';

import useIsTabVisible from '@hooks/useIsTabVisible';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/routers';
import type {ScaledSize} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {Dimensions} from 'react-native';

import createMock from '../../utils/createMock';

const mockTabNavigatorName = NAVIGATORS.TAB_NAVIGATOR;
let mockRootRouteNames: string[] = [];
let mockActiveTab: string = SCREENS.HOME;

/** Builds a root state with the active tab inside the tab navigator and the other root routes stacked above it. */
function mockBuildRootState(): NavigationState {
    return createMock<NavigationState>({
        routes: mockRootRouteNames.map((name) => ({
            key: name,
            name,
            state: name === mockTabNavigatorName ? {index: 0, routes: [{key: mockActiveTab, name: mockActiveTab}]} : undefined,
        })),
    });
}

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: NavigationState | undefined) => unknown) => selector(mockBuildRootState()),
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
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR];
        mockActiveTab = SCREENS.HOME;
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
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen still counts as visible, so its data can load while the RHP is open
        expect(result.current).toBe(true);
    });

    it('is false under an RHP on a narrow layout', () => {
        // Given a narrow window, where an RHP covers the whole screen
        currentWindow = NARROW_WINDOW;
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is hidden, so nothing is fetched for it until the RHP closes
        expect(result.current).toBe(false);
    });

    it('is false on a wide layout when another tab is active', () => {
        // Given a wide window with another tab selected
        mockedUseIsFocused.mockReturnValue(false);
        mockActiveTab = SCREENS.INSIGHTS;

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is hidden behind the other tab
        expect(result.current).toBe(false);
    });

    it('is false on a wide layout when a fullscreen covers the active tab', () => {
        // Given a wide window with a fullscreen screen pushed above the active tab, which hides it completely
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR, SCREENS.VALIDATE_LOGIN];
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen is hidden, so nothing is fetched for it behind the fullscreen
        expect(result.current).toBe(false);
    });

    it('is false on a wide layout when an RHP opens over a fullscreen that covers the active tab', () => {
        // Given a wide window with an RHP opened over a fullscreen that sits above the active tab
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR, SCREENS.CONCIERGE, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
        mockedUseIsFocused.mockReturnValue(false);

        // When the hook runs
        const {result} = renderVisibility();

        // Then the screen beside the RHP is the fullscreen, so the tab is still hidden
        expect(result.current).toBe(false);
    });

    it('follows the window across the breakpoint', () => {
        // Given an RHP open on a wide window
        mockRootRouteNames = [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
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
