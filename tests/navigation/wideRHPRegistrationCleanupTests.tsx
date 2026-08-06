import {act, render} from '@testing-library/react-native';

import type WideRHPContextProviderModule from '@components/WideRHPContextProvider';
import type {expandedRHPProgress as ExpandedRHPProgressType, useWideRHPActions as UseWideRHPActionsType, useWideRHPState as UseWideRHPStateType} from '@components/WideRHPContextProvider';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState} from '@react-navigation/native';

import React from 'react';

type TestRoute = {key: string; name: string; params?: object; state?: {routes: TestRoute[]}};

type NavigationMock = {
    isReady: boolean;
    state: {routes: TestRoute[]; preloadedRoutes?: TestRoute[]} | undefined;
};

const mockNavigation: NavigationMock = {isReady: true, state: {routes: []}};
const mockStateListeners = new Set<() => void>();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        isReady: () => mockNavigation.isReady,
        getRootState: () => mockNavigation.state,
        addListener: (_event: string, listener: () => void) => {
            mockStateListeners.add(listener);
            return () => mockStateListeners.delete(listener);
        },
    },
}));

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: <T,>(selector: (state: NavigationState | undefined) => T): T => selector(undefined),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

// Jest resolves the `.native` no-op variants of these helpers, which would feed undefined into the Animated
// values the provider creates at module load.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () => ({
    __esModule: true,
    default: () => 320,
}));

jest.mock('@libs/Navigation/helpers/calculateSuperWideRHPWidth', () => ({
    __esModule: true,
    default: () => 1000,
}));

// Jest (jest-expo) resolves the `.native` variant by default, and on native the provider does not manage wide RHP
// keys, so the web entry point is required explicitly (with its `.tsx` extension) to exercise the real one.
const providerModule: unknown = require('@components/WideRHPContextProvider/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const {
    default: WideRHPContextProvider,
    useWideRHPActions,
    useWideRHPState,
    expandedRHPProgress,
} = providerModule as {
    default: typeof WideRHPContextProviderModule;
    useWideRHPActions: typeof UseWideRHPActionsType;
    useWideRHPState: typeof UseWideRHPStateType;
    expandedRHPProgress: typeof ExpandedRHPProgressType;
};

const WIDE_ROUTE: TestRoute = {key: 'report-rhp-key', name: 'ReportScreen', params: {reportID: '42'}};

function buildRootRoutes(withRHPScreen: boolean): TestRoute[] {
    const rhpScreens: TestRoute[] = withRHPScreen ? [WIDE_ROUTE] : [{key: 'other-rhp-key', name: 'OtherScreen'}];
    return [
        {key: 'reports-split', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
        {
            key: 'rhp-navigator',
            name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
            state: {routes: [{key: 'modal-stack', name: 'right-modal-stack', state: {routes: rhpScreens}}]},
        },
    ];
}

let latestActions: ReturnType<typeof useWideRHPActions>;
let latestState: ReturnType<typeof useWideRHPState>;

function Harness() {
    // Capturing the context in module scope is what lets the tests drive the provider, so the render impurity
    // is deliberate here.
    // eslint-disable-next-line react-hooks/immutability
    latestActions = useWideRHPActions();
    // eslint-disable-next-line react-hooks/immutability
    latestState = useWideRHPState();
    return null;
}

function renderProvider() {
    return render(
        <WideRHPContextProvider>
            <Harness />
        </WideRHPContextProvider>,
    );
}

function registerWideRoute(width: 'wide' | 'super-wide' = 'wide') {
    act(() => {
        latestActions.setRHPWidth(WIDE_ROUTE, width);
    });
}

function fireStateListeners() {
    act(() => {
        for (const listener of mockStateListeners) {
            listener();
        }
    });
}

/** Replaces the navigation state and fires the state listeners, the way closing a route does in the app. */
function emitNavigationState(routes: TestRoute[]) {
    mockNavigation.state = {routes};
    fireStateListeners();
}

describe('wide RHP registrations of screens hidden by Activity', () => {
    beforeEach(() => {
        mockNavigation.isReady = true;
        mockNavigation.state = {routes: buildRootRoutes(true)};
        mockStateListeners.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows the registered route as wide while it is in the navigation state', () => {
        renderProvider();

        registerWideRoute();

        expect(latestState.wideRHPRouteKeys).toContain(WIDE_ROUTE.key);
    });

    it('keeps the registration when the state changes but the route is still there', () => {
        // This is what a hide by <Activity> looks like from the provider: effects of the screen unmounted, but
        // the route itself still present, so the RHP container must stay wide.
        renderProvider();
        registerWideRoute();

        emitNavigationState(buildRootRoutes(true));

        expect(latestState.wideRHPRouteKeys).toContain(WIDE_ROUTE.key);
    });

    describe('when the route is closed while its screen is hidden', () => {
        // A hidden screen has no mounted effects and React never re-runs the cleanups of a hidden Activity on
        // unmount, so the deregistration in useRHPWidth cannot run. The provider has to notice the close itself.

        it('deregisters the width once the route leaves the navigation state', () => {
            renderProvider();
            registerWideRoute();

            emitNavigationState(buildRootRoutes(false));

            expect(latestState.wideRHPRouteKeys).not.toContain(WIDE_ROUTE.key);
        });

        it('deregisters a super wide width the same way', () => {
            renderProvider();
            registerWideRoute('super-wide');

            emitNavigationState(buildRootRoutes(false));

            expect(latestState.superWideRHPRouteKeys).not.toContain(WIDE_ROUTE.key);
        });

        it('folds the expanded RHP once nothing wide is left', () => {
            const setValueSpy = jest.spyOn(expandedRHPProgress, 'setValue');
            renderProvider();
            registerWideRoute();
            setValueSpy.mockClear();

            emitNavigationState(buildRootRoutes(false));

            expect(setValueSpy).toHaveBeenCalledWith(0);
        });

        it('clears the report width hint so it cannot pin the report wide on a later visit', () => {
            renderProvider();
            act(() => {
                latestActions.markReportRHPWidth('42', 'super-wide');
            });
            registerWideRoute('super-wide');
            expect(latestActions.getReportRHPWidthHint('42')).toBe('super-wide');

            emitNavigationState(buildRootRoutes(false));

            expect(latestActions.getReportRHPWidthHint('42')).toBeUndefined();
        });

        it('leaves other registered routes alone', () => {
            const otherRoute: TestRoute = {key: 'other-rhp-key', name: 'OtherScreen'};
            renderProvider();
            registerWideRoute();
            act(() => {
                latestActions.setRHPWidth(otherRoute, 'wide');
            });

            emitNavigationState(buildRootRoutes(false));

            expect(latestState.wideRHPRouteKeys).toContain(otherRoute.key);
            expect(latestState.wideRHPRouteKeys).not.toContain(WIDE_ROUTE.key);
        });
    });

    it('keeps the registration of a route that is only preloaded', () => {
        renderProvider();
        registerWideRoute();

        // A preloaded route is not part of the visible routes, but it has not been closed either.
        mockNavigation.state = {routes: buildRootRoutes(false), preloadedRoutes: [WIDE_ROUTE]};
        fireStateListeners();

        // The route is not visible, so it is not among the visible wide keys, but a state change that brings it
        // back must find the registration intact.
        emitNavigationState(buildRootRoutes(true));
        expect(latestState.wideRHPRouteKeys).toContain(WIDE_ROUTE.key);
    });

    it('ignores state changes while nothing is registered', () => {
        renderProvider();

        emitNavigationState(buildRootRoutes(false));

        expect(latestState.wideRHPRouteKeys).toEqual([]);
    });

    it('stops listening when the provider unmounts', () => {
        const {unmount} = renderProvider();
        expect(mockStateListeners.size).toBeGreaterThan(0);

        unmount();

        expect(mockStateListeners.size).toBe(0);
    });
});
