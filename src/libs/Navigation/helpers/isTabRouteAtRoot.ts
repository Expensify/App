import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import getFocusedLeafScreenName from './getFocusedLeafScreenName';

/**
 * Leaf screen names that represent the root/landing view of each tab.
 * Used to decide tab-bar visibility.
 */
const SCREENS_WITH_TAB_BAR = new Set<string>([
    SCREENS.HOME,
    SCREENS.INBOX,
    SCREENS.SEARCH.ROOT,
    SCREENS.SETTINGS.ROOT,
    SCREENS.WORKSPACES_LIST,
    SCREENS.DOMAINS_LIST,
    SCREENS.WORKSPACE.INITIAL,
    SCREENS.DOMAIN.INITIAL,
]);

// Count as tab-root when they surface as the resolved leaf.
const TAB_WRAPPER_NAVIGATORS = new Set<string>([
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
]);

const isAtTabRootLevel = (name: string | undefined): boolean => !name || SCREENS_WITH_TAB_BAR.has(name) || TAB_WRAPPER_NAVIGATORS.has(name);

// Deepest `screen` in a `{screen, params}` chain (e.g. WORKSPACE_NAV → WORKSPACE_SPLIT_NAV → WORKSPACE.INITIAL).
const getPushTargetLeaf = (params: unknown): string | undefined => {
    const p = params as {screen?: unknown; params?: unknown} | undefined;
    if (typeof p?.screen !== 'string') {
        return undefined;
    }
    return getPushTargetLeaf(p.params) ?? p.screen;
};

type TabRouteLike = {
    state?: NavigationState | PartialState<NavigationState>;
    params?: unknown;
};

/**
 * Returns true when the active tab route resolves to a tab's root view.
 * Trusts the focused leaf as the source of truth. Falls back to the push target only when the
 * navigator state hasn't hydrated yet (Android cold start), so the tab bar doesn't flash on the
 * push target during the transition. Tab-level params can be stale after within-tab back
 * navigation, so they must not override an already-hydrated focused leaf.
 */
function isTabRouteAtRoot(route: TabRouteLike | undefined): boolean {
    const focusedLeaf = getFocusedLeafScreenName(route?.state);
    return isAtTabRootLevel(focusedLeaf ?? getPushTargetLeaf(route?.params));
}

export default isTabRouteAtRoot;
