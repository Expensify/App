import type {NavigationAction, ParamListBase, Router, TabNavigationState} from '@react-navigation/native';
import CONST from '@src/CONST';
import {shouldReplaceTabHistoryOnTabSwitch} from './OnyxTabNavigatorConfig';

/**
 * A factory matching the material-top-tab navigator's `UNSTABLE_router` prop: it receives the original
 * `TabRouter` and returns a shallow set of overrides that are merged on top of it
 */
type TabRouterOverrideFactory = <Action extends NavigationAction>(original: Router<TabNavigationState<ParamListBase>, Action>) => Partial<Router<TabNavigationState<ParamListBase>, Action>>;

/**
 * Navigators whose tab switches should NOT add a browser-history entry
 *
 * Kept as a single allowlist so the behavior can be widened later by adding an id here. Scoped today to
 * the distance-create flow, which is the only tab navigator that loses unsaved local state (the odometer
 * readings) when the browser BACK button silently pops a nested-tab URL
 */
const NAVIGATORS_WITH_REPLACED_TAB_HISTORY = new Set<string>([CONST.TAB.DISTANCE_REQUEST_TYPE]);

// Action types that switch tabs. `NAVIGATE` comes from URL/linking-driven switches; `JUMP_TO` /
// `NAVIGATE_DEPRECATED` are React Navigation's internal TabRouter action types (no exported constant to use)
const TAB_SWITCH_ACTION_TYPES = new Set<string>([CONST.NAVIGATION.ACTION_TYPE.NAVIGATE, 'JUMP_TO', 'NAVIGATE_DEPRECATED']);

/**
 * Builds the `UNSTABLE_router` override that collapses the tab navigator's `history` down to just the
 * focused route on every tab switch
 *
 * Why: the distance-create tabs are routed URL sub-paths. By default each tab switch grows the tab
 * navigator's `state.history`, which makes React Navigation's `useLinking` perform a browser
 * `history.push` (a new history entry). The browser BACK button then pops *within* the nested tab
 * navigator - switching tabs silently and wiping the odometer's unsaved local readings, bypassing the
 * `beforeRemove`/`transitionStart`/`tabPress` discard guards
 *
 * Keeping the history length constant (always 1) makes `useLinking`'s history delta 0, so it calls
 * `history.replace` instead of `history.push`: the URL still updates (refresh/deep-link keep working)
 * but no browser-history entry is added. Browser BACK then pops the whole DISTANCE_CREATE screen and
 * fires the existing `beforeRemove` discard guard - the same path as the header/hardware back button.
 * As a bonus, an in-navigator `GO_BACK` on a length-1 history returns `null`, so back bubbles to the
 * parent stack and closes the flow
 *
 * Exported separately from {@link getTabHistoryReplacementRouter} so the clamping behavior can be unit
 * tested independently of the platform/allowlist gating
 */
function createTabHistoryReplacementRouter(): TabRouterOverrideFactory {
    return (original) => ({
        getStateForAction(state, action, options) {
            const nextState = original.getStateForAction(state, action, options);

            // `null` => the action isn't handled by this navigator and should bubble up to the parent
            if (!nextState || !TAB_SWITCH_ACTION_TYPES.has(action.type)) {
                return nextState;
            }

            // Tab-switch actions always resolve to a full TabNavigationState (with `history`/`index`)
            const tabState = nextState as TabNavigationState<ParamListBase>;
            const focusedRoute = tabState.routes?.at(tabState.index);
            if (!tabState.history || !focusedRoute) {
                return nextState;
            }

            return {...tabState, history: [{type: 'route', key: focusedRoute.key}]};
        },
    });
}

/**
 * Returns the tab-history `UNSTABLE_router` override for the given navigator id, or `undefined` when the
 * default (history-growing) behavior should be kept. Returns `undefined` on native (no browser history)
 * and for any navigator not in {@link NAVIGATORS_WITH_REPLACED_TAB_HISTORY}
 */
function getTabHistoryReplacementRouter(id: string): TabRouterOverrideFactory | undefined {
    if (!shouldReplaceTabHistoryOnTabSwitch || !NAVIGATORS_WITH_REPLACED_TAB_HISTORY.has(id)) {
        return undefined;
    }

    return createTabHistoryReplacementRouter();
}

export default getTabHistoryReplacementRouter;
export {createTabHistoryReplacementRouter, NAVIGATORS_WITH_REPLACED_TAB_HISTORY};
export type {TabRouterOverrideFactory};
