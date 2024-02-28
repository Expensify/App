import type {BottomTabName, CentralPaneName} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const TAB_TO_CENTRAL_PANE_MAPPING: Record<BottomTabName, CentralPaneName[]> = {
    [SCREENS.HOME]: [SCREENS.REPORT],
    [SCREENS.ALL_SETTINGS]: [SCREENS.SETTINGS.WORKSPACES],
    [SCREENS.WORKSPACE.INITIAL]: [
        SCREENS.WORKSPACE.PROFILE,
        SCREENS.WORKSPACE.CARD,
        SCREENS.WORKSPACE.WORKFLOWS,
        SCREENS.WORKSPACE.REIMBURSE,
        SCREENS.WORKSPACE.BILLS,
        SCREENS.WORKSPACE.INVOICES,
        SCREENS.WORKSPACE.TRAVEL,
        SCREENS.WORKSPACE.MEMBERS,
        SCREENS.WORKSPACE.CATEGORIES,
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
