import type {CentralPaneName} from './Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import {CENTRAL_PANE_SCREEN_NAMES} from './Navigation/AppNavigator/CENTRAL_PANE_SCREENS';

function isCentralPaneName(screen: string | undefined): screen is CentralPaneName {
    if (!screen) {
        return false;
    }

    return CENTRAL_PANE_SCREEN_NAMES.includes(screen);
}

export default isCentralPaneName;
