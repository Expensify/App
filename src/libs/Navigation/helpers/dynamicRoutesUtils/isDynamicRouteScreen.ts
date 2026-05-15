import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import {dynamicRoutePaths} from './isDynamicRouteSuffix';

/**
 * Checks if a screen name is a dynamic route screen
 * @param screenName - The name of the screen to check.
 * @returns True if the screen name is a dynamic route screen, false otherwise.
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    const screenPath = normalizedConfigs[screenName]?.path;

    if (!screenPath) {
        return false;
    }

    return dynamicRoutePaths.has(screenPath as DynamicRouteSuffix);
}

export default isDynamicRouteScreen;
