import SCREENS from '@src/SCREENS';
import type {CentralPaneName} from './Navigation/types';

const CENTRAL_PANE_SCREEN_NAMES = [
    SCREENS.SETTINGS.WORKSPACES,
    SCREENS.SETTINGS.PREFERENCES.ROOT,
    SCREENS.SETTINGS.SECURITY,
    SCREENS.SETTINGS.PROFILE.ROOT,
    SCREENS.SETTINGS.WALLET.ROOT,
    SCREENS.SETTINGS.ABOUT,
    SCREENS.SETTINGS.TROUBLESHOOT,
    SCREENS.SETTINGS.SAVE_THE_WORLD,
    SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
    SCREENS.SEARCH.CENTRAL_PANE,
    SCREENS.REPORT,
];

function isCentralPaneName(screen: string | undefined): screen is CentralPaneName {
    if (!screen) {
        return false;
    }

    return CENTRAL_PANE_SCREEN_NAMES.includes(screen as CentralPaneName);
}

export default isCentralPaneName;
