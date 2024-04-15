import type {BottomTabName, CentralPaneName} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const TAB_TO_CENTRAL_PANE_MAPPING: Record<BottomTabName, CentralPaneName[]> = {
    [SCREENS.HOME]: [SCREENS.REPORT],
    [SCREENS.SETTINGS.ROOT]: [
        SCREENS.SETTINGS.PROFILE.ROOT,
        SCREENS.SETTINGS.PREFERENCES.ROOT,
        SCREENS.SETTINGS.SECURITY,
        SCREENS.SETTINGS.WALLET.ROOT,
        SCREENS.SETTINGS.ABOUT,
        SCREENS.SETTINGS.WORKSPACES,
        SCREENS.SETTINGS.TROUBLESHOOT,
    ],
};

const generateCentralPaneToTabMapping = (): Record<CentralPaneName, BottomTabName> => {
    const mapping: Record<CentralPaneName, BottomTabName> = {} as Record<CentralPaneName, BottomTabName>;
    for (const [tabName, centralPaneNames] of Object.entries(TAB_TO_CENTRAL_PANE_MAPPING)) {
        for (const centralPaneName of centralPaneNames) {
            mapping[centralPaneName] = tabName as BottomTabName;
        }
    }
    return mapping;
};

const CENTRAL_PANE_TO_TAB_MAPPING: Record<CentralPaneName, BottomTabName> = generateCentralPaneToTabMapping();

export {CENTRAL_PANE_TO_TAB_MAPPING};
export default TAB_TO_CENTRAL_PANE_MAPPING;
