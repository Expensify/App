import NAVIGATORS from '@src/NAVIGATORS';

import isDynamicRouteSuffix from './dynamicRoutesUtils/isDynamicRouteSuffix';

type ScreenConfigEntry = string | {path?: string; screens?: Record<string, ScreenConfigEntry>};

const navigatorNames = new Set(Object.values(NAVIGATORS) as string[]);

type CollectResult = {
    screensWithTabNavigator: Set<string>;

    /** Maps dynamic-route pattern - tab-child paths of that screen's tab navigator.
     * Used by findAllMatchingDynamicSuffixes to safely strip trailing tab segments. */
    dynamicTabPatternToTabPaths: Map<string, Set<string>>;

    /** Maps host screen name - (tab path - tab screen name) for dynamic tab-host screens.
     * Used by getStateForDynamicRoute for O(1) tab screen name lookup. */
    dynamicTabScreensByHost: Map<string, Map<string, string>>;
};

/**
 * Recursively walks the linking config tree and collects:
 * 1. `screensWithTabNavigator` - screen names that host an OnyxTabNavigator
 *    (identified by having both a `path` and nested `screens`, navigators excluded).
 * 2. `dynamicTabPatternToTabPaths` - for each tab-host screen that is also a dynamic
 *    route, a mapping from its route pattern to the path values of its tab children.
 *
 * @param screens - The linking config screens object (or a nested `screens` subtree)
 * @param result - Accumulator passed through recursive calls
 * @returns Collected data
 */
function collectScreensWithTabNavigator(
    screens: Record<string, ScreenConfigEntry>,
    result: CollectResult = {screensWithTabNavigator: new Set(), dynamicTabPatternToTabPaths: new Map(), dynamicTabScreensByHost: new Map()},
): CollectResult {
    const screenConfigEntries = Object.entries(screens);
    for (const [screenName, screenConfig] of screenConfigEntries) {
        if (typeof screenConfig === 'object' && screenConfig !== null) {
            if (screenConfig.path !== undefined && screenConfig.screens && !navigatorNames.has(screenName)) {
                result.screensWithTabNavigator.add(screenName);

                // For dynamic tab-host screens, map the route pattern - tab paths for findAllMatchingDynamicSuffixes,
                // and map host screen name - (tab path - tab screen name) for getStateForDynamicRoute.
                if (isDynamicRouteSuffix(screenConfig.path)) {
                    const tabPaths = new Set<string>();
                    const tabScreensByPath = new Map<string, string>();
                    for (const [tabScreenName, tabConfig] of Object.entries(screenConfig.screens)) {
                        const tabPath = typeof tabConfig === 'string' ? tabConfig : tabConfig?.path;
                        if (tabPath) {
                            tabPaths.add(tabPath);
                            tabScreensByPath.set(tabPath, tabScreenName);
                        }
                    }
                    if (tabPaths.size > 0) {
                        result.dynamicTabPatternToTabPaths.set(screenConfig.path, tabPaths);
                        result.dynamicTabScreensByHost.set(screenName, tabScreensByPath);
                    }
                }
            }
            if (screenConfig.screens) {
                collectScreensWithTabNavigator(screenConfig.screens, result);
            }
        }
    }
    return result;
}

export type {ScreenConfigEntry};
export default collectScreensWithTabNavigator;
