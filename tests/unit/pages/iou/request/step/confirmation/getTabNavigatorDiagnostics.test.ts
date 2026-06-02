import type {NavigationState} from '@react-navigation/native';
import getTabNavigatorDiagnostics from '@pages/iou/request/step/confirmation/getTabNavigatorDiagnostics';
import NAVIGATORS from '@src/NAVIGATORS';

const mockGetRootState = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        getRootState: () => mockGetRootState() as unknown,
    },
}));

function asNavigationState(state: unknown): NavigationState {
    return state as NavigationState;
}

describe('getTabNavigatorDiagnostics', () => {
    beforeEach(() => {
        mockGetRootState.mockReset();
    });

    it('returns unavailable diagnostics when there is no root state', () => {
        mockGetRootState.mockReturnValue(undefined);

        expect(getTabNavigatorDiagnostics()).toEqual({
            tabNavigatorStateAvailable: false,
            tabActiveName: undefined,
            activeTabState: undefined,
        });
    });

    it('returns unavailable diagnostics when TAB_NAVIGATOR is missing', () => {
        const rootState = asNavigationState({
            routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}],
        });

        expect(getTabNavigatorDiagnostics(rootState)).toEqual({
            tabNavigatorStateAvailable: false,
            tabActiveName: undefined,
            activeTabState: undefined,
        });
    });

    it('returns unavailable diagnostics when TAB_NAVIGATOR has no nested state', () => {
        const rootState = asNavigationState({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR}],
        });

        expect(getTabNavigatorDiagnostics(rootState)).toEqual({
            tabNavigatorStateAvailable: false,
            tabActiveName: undefined,
            activeTabState: undefined,
        });
    });

    it('returns available diagnostics with undefined active route fields for an out-of-range index', () => {
        const rootState = asNavigationState({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 5,
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
                    },
                },
            ],
        });

        expect(getTabNavigatorDiagnostics(rootState)).toEqual({
            tabNavigatorStateAvailable: true,
            tabActiveName: undefined,
            activeTabState: undefined,
        });
    });

    it('returns the active tab name and nested state when available', () => {
        const activeTabState = {
            index: 0,
            routes: [{name: 'SearchRoot'}],
        };
        const rootState = asNavigationState({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: activeTabState}],
                    },
                },
            ],
        });

        expect(getTabNavigatorDiagnostics(rootState)).toEqual({
            tabNavigatorStateAvailable: true,
            tabActiveName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            activeTabState,
        });
    });

    it('ignores active tab nested state when it does not contain routes', () => {
        const rootState = asNavigationState({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {index: 0}}],
                    },
                },
            ],
        });

        expect(getTabNavigatorDiagnostics(rootState)).toEqual({
            tabNavigatorStateAvailable: true,
            tabActiveName: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            activeTabState: undefined,
        });
    });
});
