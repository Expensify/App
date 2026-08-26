import {renderHook} from '@testing-library/react-native';

import NAVIGATORS from '@src/NAVIGATORS';

type RootRoute = {name: string; key: string};

let mockRootRoutes: RootRoute[] = [];
let mockActiveTabRoute: RootRoute | undefined;
let mockIsFocused = false;

// All three read live navigation state in production, so the harness swaps the state and re-renders rather than remounting.
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: {routes: RootRoute[]} | undefined) => unknown) => selector({routes: mockRootRoutes}),
}));

jest.mock('@navigation/helpers/getTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: () => mockActiveTabRoute,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

const REPORTS_TAB: RootRoute = {name: 'ReportsSplitNavigator', key: 'reports-tab-1'};
const SEARCH_TAB: RootRoute = {name: 'SearchFullscreenNavigator', key: 'search-tab-1'};
const TAB_NAVIGATOR: RootRoute = {name: NAVIGATORS.TAB_NAVIGATOR, key: 'tabs-1'};
const RHP: RootRoute = {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'rhp-1'};

const {default: useIsReportVisible} = require<{default: (shouldUseNarrowLayout: boolean) => boolean}>('../../src/hooks/useIsReportVisible.ts');

/** Renders focused on the Reports tab, which is how a report screen always mounts, then hands back a way to move the state. */
function renderHarness(shouldUseNarrowLayout: boolean) {
    mockRootRoutes = [TAB_NAVIGATOR];
    mockActiveTabRoute = REPORTS_TAB;
    mockIsFocused = true;

    const utils = renderHook(() => useIsReportVisible(shouldUseNarrowLayout));
    return {
        ...utils,
        navigateTo: (routes: RootRoute[], tabRoute: RootRoute, focused: boolean) => {
            mockRootRoutes = routes;
            mockActiveTabRoute = tabRoute;
            mockIsFocused = focused;
            utils.rerender(undefined);
        },
    };
}

describe('useIsReportVisible', () => {
    it('is visible while focused', () => {
        const {result} = renderHarness(false);
        expect(result.current).toBe(true);
    });

    it('stays visible on a wide pane when an RHP opens over its own tab', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([TAB_NAVIGATOR, RHP], REPORTS_TAB, false);

        expect(result.current).toBe(true);
    });

    it('is not visible once another tab covers it', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([TAB_NAVIGATOR], SEARCH_TAB, false);

        expect(result.current).toBe(false);
    });

    it('is not visible when an RHP opens over a different tab', () => {
        const {result, navigateTo} = renderHarness(false);

        // Tabs switch inside the root's tab navigator, so the root routes here are identical to the own-tab case above.
        navigateTo([TAB_NAVIGATOR], SEARCH_TAB, false);
        navigateTo([TAB_NAVIGATOR, RHP], SEARCH_TAB, false);

        expect(result.current).toBe(false);
    });

    it('becomes visible under an RHP again once its own tab is back on top', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([TAB_NAVIGATOR, RHP], SEARCH_TAB, false);
        expect(result.current).toBe(false);

        navigateTo([TAB_NAVIGATOR], REPORTS_TAB, true);
        navigateTo([TAB_NAVIGATOR, RHP], REPORTS_TAB, false);

        expect(result.current).toBe(true);
    });

    it('waits for the RHP to close on a narrow pane, which covers rather than flanks it', () => {
        const {result, navigateTo} = renderHarness(true);

        navigateTo([TAB_NAVIGATOR, RHP], REPORTS_TAB, false);
        expect(result.current).toBe(false);

        navigateTo([TAB_NAVIGATOR], REPORTS_TAB, true);
        expect(result.current).toBe(true);
    });
});
