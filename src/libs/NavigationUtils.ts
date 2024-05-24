import type {CentralPaneScreen} from './Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import {CENTRAL_PANE_SCREEN_NAMES} from './Navigation/AppNavigator/CENTRAL_PANE_SCREENS';

function isCentralPaneScreen(screen: string | undefined): screen is CentralPaneScreen {
    if (!screen) {
        return false;
    }

    return CENTRAL_PANE_SCREEN_NAMES.includes(screen);
}

export default isCentralPaneScreen;
