import type {CentralPaneScreen} from '@libs/Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import type {BottomTabName} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const TAB_TO_CENTRAL_PANE_MAPPING: Record<BottomTabName, CentralPaneScreen[]> = {
    [SCREENS.HOME]: [SCREENS.REPORT],
    [SCREENS.SEARCH.BOTTOM_TAB]: [SCREENS.SEARCH.CENTRAL_PANE],
    [SCREENS.SETTINGS.ROOT]: [
        SCREENS.SETTINGS.PROFILE.ROOT,
        SCREENS.SETTINGS.PREFERENCES.ROOT,
        SCREENS.SETTINGS.SECURITY,
        SCREENS.SETTINGS.WALLET.ROOT,
        SCREENS.SETTINGS.ABOUT,
        SCREENS.SETTINGS.WORKSPACES,
        SCREENS.SETTINGS.SAVE_THE_WORLD,
        SCREENS.SETTINGS.TROUBLESHOOT,
    ],
};

const generateCentralPaneToTabMapping = (): Record<CentralPaneScreen, BottomTabName> => {
    const mapping: Record<CentralPaneScreen, BottomTabName> = {} as Record<CentralPaneScreen, BottomTabName>;
    for (const [tabName, CentralPaneScreens] of Object.entries(TAB_TO_CENTRAL_PANE_MAPPING)) {
        for (const CentralPaneScreen of CentralPaneScreens) {
            mapping[CentralPaneScreen] = tabName as BottomTabName;
        }
    }
    return mapping;
};

const CENTRAL_PANE_TO_TAB_MAPPING: Record<CentralPaneScreen, BottomTabName> = generateCentralPaneToTabMapping();

export {CENTRAL_PANE_TO_TAB_MAPPING};
export default TAB_TO_CENTRAL_PANE_MAPPING;
