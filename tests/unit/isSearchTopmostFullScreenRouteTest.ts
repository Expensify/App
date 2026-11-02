import {setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mockNavigationRef = {
    getRootState: jest.fn(),
};

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: mockNavigationRef,
}));

const {default: isSearchTopmostFullScreenRoute}: {default: () => boolean} = jest.requireActual('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute');

const makeTabState = () => ({
    stale: false as const,
    type: 'tab',
    key: 'tab-state-key',
    index: 2,
    routeNames: [SCREENS.HOME, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR],
    routes: [
        {key: 'home-key', name: SCREENS.HOME},
        {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
        {key: 'search-key', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
    ],
});

const rootStateWithTab = (state?: ReturnType<typeof makeTabState>) => ({
    stale: false,
    type: 'stack',
    key: 'root-key',
    index: 0,
    routeNames: [NAVIGATORS.TAB_NAVIGATOR],
    routes: [
        {
            key: 'tab-key',
            name: NAVIGATORS.TAB_NAVIGATOR,
            state,
        },
    ],
});

const rootStateWithTabScreenParam = () => ({
    stale: false,
    type: 'stack',
    key: 'root-key',
    index: 0,
    routeNames: [NAVIGATORS.TAB_NAVIGATOR],
    routes: [
        {
            key: 'tab-key-without-preserved-state',
            name: NAVIGATORS.TAB_NAVIGATOR,
            params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
        },
    ],
});

describe('isSearchTopmostFullScreenRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const tabState = makeTabState();
        mockNavigationRef.getRootState.mockReturnValue(rootStateWithTab(tabState));
        setPreservedNavigatorState('tab-key', tabState);
    });

    it('returns true when live tab state has Search active', () => {
        expect(isSearchTopmostFullScreenRoute()).toBe(true);
    });

    it('returns true from preserved tab state when live tab state is missing', () => {
        mockNavigationRef.getRootState.mockReturnValue(rootStateWithTab(undefined));

        expect(isSearchTopmostFullScreenRoute()).toBe(true);
    });

    it('returns false from tab screen params when live and preserved tab state are missing', () => {
        mockNavigationRef.getRootState.mockReturnValue(rootStateWithTabScreenParam());

        expect(isSearchTopmostFullScreenRoute()).toBe(false);
    });
});
