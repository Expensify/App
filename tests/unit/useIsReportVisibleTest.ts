import {renderHook} from '@testing-library/react-native';

import NAVIGATORS from '@src/NAVIGATORS';

type RootRoute = {name: string; key: string; state?: {index: number; routes: RootRoute[]}};

let mockRootRoutes: RootRoute[] = [];
let mockIsFocused = false;

// Both read live navigation state in production, so the harness swaps the state and re-renders rather than remounting.
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: {routes: RootRoute[]} | undefined) => unknown) => selector({routes: mockRootRoutes}),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

const REPORTS_TAB: RootRoute = {name: 'ReportsSplitNavigator', key: 'reports-tab-1'};
const SEARCH_TAB: RootRoute = {name: 'SearchFullscreenNavigator', key: 'search-tab-1'};
const RHP: RootRoute = {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'rhp-1'};

/** Tabs live inside one root-level tab navigator, so switching them changes this nested route rather than the root routes. */
const tabs = (activeTab: RootRoute): RootRoute => ({
    name: NAVIGATORS.TAB_NAVIGATOR,
    key: 'tabs-1',
    state: {index: 0, routes: [activeTab]},
});

const {default: useIsReportVisible} = require<{default: (shouldUseNarrowLayout: boolean) => boolean}>('../../src/hooks/useIsReportVisible.ts');

function renderHarness(shouldUseNarrowLayout: boolean, {activeTab = REPORTS_TAB, isFocused = true} = {}) {
    mockRootRoutes = [tabs(activeTab)];
    mockIsFocused = isFocused;

    const utils = renderHook(() => useIsReportVisible(shouldUseNarrowLayout));
    return {
        ...utils,
        navigateTo: (routes: RootRoute[], focused: boolean) => {
            mockRootRoutes = routes;
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

        navigateTo([tabs(REPORTS_TAB), RHP], false);

        expect(result.current).toBe(true);
    });

    it('is not visible once another tab covers it', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([tabs(SEARCH_TAB)], false);

        expect(result.current).toBe(false);
    });

    it('is not visible when an RHP opens over a different tab', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([tabs(SEARCH_TAB)], false);
        navigateTo([tabs(SEARCH_TAB), RHP], false);

        expect(result.current).toBe(false);
    });

    it('becomes visible under an RHP again once its own tab is back on top', () => {
        const {result, navigateTo} = renderHarness(false);

        navigateTo([tabs(SEARCH_TAB), RHP], false);
        expect(result.current).toBe(false);

        navigateTo([tabs(REPORTS_TAB)], true);
        navigateTo([tabs(REPORTS_TAB), RHP], false);

        expect(result.current).toBe(true);
    });

    it('claims no tab when it mounts in one that is not on top, so a later RHP cannot make it look visible', () => {
        // A preview mounts from an Onyx update while the user is on another tab, which is the one case that never holds focus at mount.
        const {result, navigateTo} = renderHarness(false, {activeTab: SEARCH_TAB, isFocused: false});
        expect(result.current).toBe(false);

        navigateTo([tabs(SEARCH_TAB), RHP], false);

        expect(result.current).toBe(false);
    });

    it('waits for the RHP to close on a narrow pane, which covers rather than flanks it', () => {
        const {result, navigateTo} = renderHarness(true);

        navigateTo([tabs(REPORTS_TAB), RHP], false);
        expect(result.current).toBe(false);

        navigateTo([tabs(REPORTS_TAB)], true);
        expect(result.current).toBe(true);
    });
});
