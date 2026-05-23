import NAVIGATORS from '@src/NAVIGATORS';

type ScreenConfigEntry = string | {path?: string; screens?: Record<string, ScreenConfigEntry>};

const navigatorNames = new Set(Object.values(NAVIGATORS) as string[]);

/**
 * Recursively walks the linking config tree and collects screen names that host
 * an OnyxTabNavigator. These screens are identified by having both a `path` and
 * nested `screens` - a pattern unique to tab-hosting screens in the config.
 * Navigator entries (from NAVIGATORS) are excluded to avoid false positives.
 *
 * @param screens - The linking config screens object (or a nested `screens` subtree)
 * @param result - Accumulator set passed through recursive calls
 * @returns Set of screen names that contain an OnyxTabNavigator
 */
function collectScreensWithTabNavigator(screens: Record<string, ScreenConfigEntry>, result: Set<string> = new Set<string>()): Set<string> {
    const screenConfigEntries = Object.entries(screens);
    for (const [screenName, screenConfig] of screenConfigEntries) {
        if (typeof screenConfig === 'object' && screenConfig !== null) {
            if (screenConfig.path !== undefined && screenConfig.screens && !navigatorNames.has(screenName)) {
                result.add(screenName);
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
