import type {NavigationState, PartialState} from '@react-navigation/native';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getMatchingNewRoute from '@libs/Navigation/helpers/getMatchingNewRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getMatchingNewRoute', () => jest.fn());
jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
}));

const mockGetStateFromPath = jest.mocked(getStateFromPath);
const mockGetMatchingNewRoute = jest.mocked(getMatchingNewRoute);

/** Builds a root state whose only route is a TAB_NAVIGATOR with the provided nested tab routes. */
function buildTabNavigatorRootState(tabRoutes: Array<{name: string; state?: PartialState<NavigationState>; params?: Record<string, unknown>}>, index: number): PartialState<NavigationState> {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {routes: tabRoutes, index},
            },
        ],
        index: 0,
    };
}

function getTabStrip(state: ReturnType<typeof getAdaptedStateFromPath>) {
    const tabRoute = state?.routes?.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    return tabRoute?.state;
}

describe('getAdaptedStateFromPath - tab strip normalization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Leave the path untouched so getStateFromPath receives the original path.
        mockGetMatchingNewRoute.mockReturnValue(undefined);
    });

    it('normalizes a sparse cold-start strip (only the matched tab) to the full TAB_SCREENS strip with the matched tab active', () => {
        // RN's getStateFromPath emits only the tab the URL matched (e.g. cold-start on Home).
        mockGetStateFromPath.mockReturnValue(buildTabNavigatorRootState([{name: SCREENS.HOME}], 0));

        const result = getAdaptedStateFromPath('/', undefined, false);
        const strip = getTabStrip(result);

        expect(strip?.routes.map((route) => route.name)).toEqual([...TAB_SCREENS]);
        expect(strip?.index).toBe(TAB_SCREENS.indexOf(SCREENS.HOME));
    });

    it('places the matched tab at its TAB_SCREENS index and preserves its nested state when normalizing', () => {
        const searchNestedState: PartialState<NavigationState> = {routes: [{name: SCREENS.SEARCH.ROOT}], index: 0};
        // Sparse strip where the only present tab is Search (e.g. deep-link straight into the Search tab).
        mockGetStateFromPath.mockReturnValue(buildTabNavigatorRootState([{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: searchNestedState}], 0));

        const result = getAdaptedStateFromPath('/search', undefined, false);
        const strip = getTabStrip(result);

        const searchIndex = TAB_SCREENS.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        expect(strip?.routes.map((route) => route.name)).toEqual([...TAB_SCREENS]);
        expect(strip?.index).toBe(searchIndex);
        expect(strip?.routes.at(searchIndex)?.state).toEqual(searchNestedState);
    });

    it('leaves an already-complete strip unchanged', () => {
        const fullStrip = TAB_SCREENS.map((name) => ({name}));
        const activeIndex = TAB_SCREENS.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        mockGetStateFromPath.mockReturnValue(buildTabNavigatorRootState(fullStrip, activeIndex));

        const result = getAdaptedStateFromPath('/search', undefined, false);
        const strip = getTabStrip(result);

        expect(strip?.routes.map((route) => route.name)).toEqual([...TAB_SCREENS]);
        expect(strip?.index).toBe(activeIndex);
    });
});
