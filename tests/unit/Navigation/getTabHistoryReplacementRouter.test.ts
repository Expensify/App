import type {NavigationAction, ParamListBase, Router, RouterConfigOptions, TabNavigationState} from '@react-navigation/native';
import {TabActions, TabRouter} from '@react-navigation/native';
import getTabHistoryReplacementRouter, {createTabHistoryReplacementRouter} from '@libs/Navigation/getTabHistoryReplacementRouter';
import CONST from '@src/CONST';

// Force the web behavior (flag is `false` on native, `true` on web) so the allowlist gating is
// deterministic regardless of the platform jest resolves `OnyxTabNavigatorConfig` to.
jest.mock('@libs/Navigation/OnyxTabNavigatorConfig', () => ({
    shouldReplaceTabHistoryOnTabSwitch: true,
    defaultScreenOptions: {},
}));

const ROUTE_NAMES = ['map', 'manual', 'gps', 'odometer'];
const INITIAL_ROUTE = 'map';

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: ROUTE_NAMES,
    routeParamList: {},
    routeGetIdList: {},
};

/** A real TabRouter configured like the distance-create navigator (initialRoute back behavior). */
function buildOriginalRouter(): Router<TabNavigationState<ParamListBase>, NavigationAction> {
    return TabRouter({initialRouteName: INITIAL_ROUTE, backBehavior: 'initialRoute'}) as unknown as Router<TabNavigationState<ParamListBase>, NavigationAction>;
}

/** The same TabRouter with our history-clamping override merged on top. */
function buildWrappedRouter() {
    const original = buildOriginalRouter();
    return {...original, ...createTabHistoryReplacementRouter()(original)};
}

function getInitialState(router: Router<TabNavigationState<ParamListBase>, NavigationAction>): TabNavigationState<ParamListBase> {
    return router.getInitialState(CONFIG_OPTIONS);
}

function focusedRouteName(state: TabNavigationState<ParamListBase>): string | undefined {
    return state.routes.at(state.index)?.name;
}

describe('createTabHistoryReplacementRouter', () => {
    it('clamps history to the focused route when switching from the initial tab to another tab', () => {
        const wrapped = buildWrappedRouter();
        const initialState = getInitialState(wrapped);

        const nextState = wrapped.getStateForAction(initialState, TabActions.jumpTo('odometer'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;

        expect(nextState).not.toBeNull();
        expect(focusedRouteName(nextState)).toBe('odometer');
        // The whole point: history stays length 1 so useLinking does history.replace (no new browser entry).
        expect(nextState.history).toHaveLength(1);
        expect(nextState.history.at(0)?.key).toBe(nextState.routes.at(nextState.index)?.key);
    });

    it('matches the stock TabRouter except for the clamped history length', () => {
        const original = buildOriginalRouter();
        const wrapped = buildWrappedRouter();
        const initialState = getInitialState(original);

        const originalNext = original.getStateForAction(initialState, TabActions.jumpTo('odometer'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;
        const wrappedNext = wrapped.getStateForAction(initialState, TabActions.jumpTo('odometer'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;

        // Stock router grows history (initial -> non-initial == length 2); ours collapses it to 1.
        expect(originalNext.history.length).toBeGreaterThan(1);
        expect(wrappedNext.history).toHaveLength(1);
        // Everything else (index / focused route) is identical.
        expect(wrappedNext.index).toBe(originalNext.index);
        expect(focusedRouteName(wrappedNext)).toBe(focusedRouteName(originalNext));
    });

    it('keeps history at length 1 when switching between two non-initial tabs', () => {
        const wrapped = buildWrappedRouter();
        const onOdometer = wrapped.getStateForAction(getInitialState(wrapped), TabActions.jumpTo('odometer'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;

        const onManual = wrapped.getStateForAction(onOdometer, TabActions.jumpTo('manual'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;

        expect(focusedRouteName(onManual)).toBe('manual');
        expect(onManual.history).toHaveLength(1);
    });

    it('returns null for an in-navigator GO_BACK on the clamped history so back bubbles to the parent', () => {
        const wrapped = buildWrappedRouter();
        const onOdometer = wrapped.getStateForAction(getInitialState(wrapped), TabActions.jumpTo('odometer'), CONFIG_OPTIONS) as TabNavigationState<ParamListBase>;

        const afterBack = wrapped.getStateForAction(onOdometer, {type: CONST.NAVIGATION.ACTION_TYPE.GO_BACK} as NavigationAction, CONFIG_OPTIONS);

        expect(afterBack).toBeNull();
    });

    it('still matches the React Navigation TabRouter action type for tab switches', () => {
        // Guards the action-type coupling: the history clamp only fires for actions in TAB_SWITCH_ACTION_TYPES,
        // so if a RN upgrade renamed JUMP_TO the clamp would silently stop working
        expect(TabActions.jumpTo('odometer').type).toBe(CONST.NAVIGATION.ACTION_TYPE.JUMP_TO);
    });

    it('does not touch state for non-tab-switch actions (passes the stock result through)', () => {
        const original = buildOriginalRouter();
        const wrapped = buildWrappedRouter();
        const initialState = getInitialState(wrapped);

        const setParams = {type: 'SET_PARAMS', source: initialState.routes.at(0)?.key, payload: {params: {foo: 'bar'}}} as NavigationAction;
        const originalNext = original.getStateForAction(initialState, setParams, CONFIG_OPTIONS);
        const wrappedNext = wrapped.getStateForAction(initialState, setParams, CONFIG_OPTIONS);

        expect(wrappedNext).toEqual(originalNext);
    });
});

describe('getTabHistoryReplacementRouter', () => {
    it('returns an override factory for the allowlisted distance navigator', () => {
        expect(typeof getTabHistoryReplacementRouter(CONST.TAB.DISTANCE_REQUEST_TYPE)).toBe('function');
    });

    it('returns undefined for navigators that are not allowlisted', () => {
        expect(getTabHistoryReplacementRouter(CONST.TAB.IOU_REQUEST_TYPE)).toBeUndefined();
        expect(getTabHistoryReplacementRouter(CONST.TAB.SPLIT_EXPENSE_TAB_TYPE)).toBeUndefined();
    });
});
