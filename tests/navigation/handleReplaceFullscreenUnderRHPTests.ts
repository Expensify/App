import type {NavigationState, ParamListBase, PartialState, StackNavigationState} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import {clearPreInsertedOriginalTabRoute, handleReplaceFullscreenUnderRHP} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {ReplaceFullscreenUnderRHPActionType} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
}));

const mockGetStateFromPath = jest.mocked(getStateFromPath);

const ROUTE_NAMES = [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];

const stackRouter = StackRouter({});
const configOptions = {routeNames: ROUTE_NAMES, routeParamList: {}, routeGetIdList: {}};

const searchNestedState: PartialState<NavigationState> = {routes: [{name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense'}}], index: 0};

/** The state getStateFromPath resolves the payload route to: a TAB_NAVIGATOR focused on the Search tab. */
const targetStateForSearch: PartialState<NavigationState> = {
    routes: [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {routes: [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, state: searchNestedState}], index: 0},
        },
    ],
    index: 0,
};

function buildRootStackState(tabRouteState?: PartialState<NavigationState>): StackNavigationState<ParamListBase> {
    return {
        key: 'stack-root',
        index: 1,
        routeNames: ROUTE_NAMES,
        routes: [
            {key: 'TabNavigator-1', name: NAVIGATORS.TAB_NAVIGATOR, state: tabRouteState},
            {key: 'RightModalNavigator-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ],
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

const replaceAction: ReplaceFullscreenUnderRHPActionType = {
    type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
    payload: {route: ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'})},
};

function getTabStrip(result: ReturnType<typeof handleReplaceFullscreenUnderRHP>) {
    const tabRoute = result?.routes.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    return tabRoute?.state;
}

describe('handleReplaceFullscreenUnderRHP - tab switch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearPreInsertedOriginalTabRoute();
        mockGetStateFromPath.mockReturnValue(targetStateForSearch);
    });

    it('switches to the target tab when the TAB_NAVIGATOR route carries no nested state hint (e.g. right after sign-in)', () => {
        const state = buildRootStackState(undefined);

        const result = handleReplaceFullscreenUnderRHP(state, replaceAction, configOptions, stackRouter);
        const strip = getTabStrip(result);

        expect(result).not.toBeNull();
        expect(strip?.routes.map((route) => route.name)).toEqual([...TAB_SCREENS]);
        expect(strip?.index).toBe(TAB_SCREENS.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
        expect(strip?.routes.at(strip.index ?? -1)?.state).toEqual(searchNestedState);
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('switches to the target tab within an existing full strip, leaving other tabs intact', () => {
        const homeNestedState: PartialState<NavigationState> = {routes: [{name: 'SomeHomeScreen'}], index: 0};
        const fullStrip: PartialState<NavigationState> = {
            routes: TAB_SCREENS.map((name) => (name === SCREENS.HOME ? {name, state: homeNestedState} : {name})),
            index: TAB_SCREENS.indexOf(SCREENS.HOME),
        };
        const state = buildRootStackState(fullStrip);

        const result = handleReplaceFullscreenUnderRHP(state, replaceAction, configOptions, stackRouter);
        const strip = getTabStrip(result);

        expect(result).not.toBeNull();
        expect(strip?.routes.map((route) => route.name)).toEqual([...TAB_SCREENS]);
        expect(strip?.index).toBe(TAB_SCREENS.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
        expect(strip?.routes.at(TAB_SCREENS.indexOf(SCREENS.HOME))?.state).toEqual(homeNestedState);
    });
});
