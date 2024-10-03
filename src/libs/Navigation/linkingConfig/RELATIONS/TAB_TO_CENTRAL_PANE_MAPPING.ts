import type {SplitNavigatorLHNScreen, SplitNavigatorScreenName} from '@navigation/types';
import SCREENS from '@src/SCREENS';

const TAB_TO_CENTRAL_PANE_MAPPING: Record<SplitNavigatorLHNScreen, SplitNavigatorScreenName[]> = {
    [SCREENS.HOME]: [SCREENS.REPORT],
    [SCREENS.SETTINGS.ROOT]: [
        SCREENS.SETTINGS.PROFILE.ROOT,
        SCREENS.SETTINGS.PREFERENCES.ROOT,
        SCREENS.SETTINGS.SECURITY,
        SCREENS.SETTINGS.WALLET.ROOT,
        SCREENS.SETTINGS.ABOUT,
        SCREENS.SETTINGS.WORKSPACES,
        SCREENS.SETTINGS.SAVE_THE_WORLD,
        SCREENS.SETTINGS.TROUBLESHOOT,
        SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
    ],
    [SCREENS.WORKSPACE.INITIAL]: [
        SCREENS.WORKSPACE.PROFILE,
        SCREENS.WORKSPACE.REIMBURSE,
        SCREENS.WORKSPACE.MEMBERS,
        SCREENS.WORKSPACE.WORKFLOWS,
        SCREENS.WORKSPACE.ACCOUNTING.ROOT,
        SCREENS.WORKSPACE.TAXES,
        SCREENS.WORKSPACE.TAGS,
        SCREENS.WORKSPACE.CATEGORIES,
        SCREENS.WORKSPACE.DISTANCE_RATES,
        SCREENS.WORKSPACE.REPORT_FIELDS,
        SCREENS.WORKSPACE.INVOICES,
        SCREENS.WORKSPACE.EXPENSIFY_CARD,
    ],
};

const generateCentralPaneToTabMapping = (): Record<SplitNavigatorScreenName, SplitNavigatorScreenName> => {
    const mapping: Record<SplitNavigatorScreenName, SplitNavigatorScreenName> = {} as Record<SplitNavigatorScreenName, SplitNavigatorScreenName>;
    for (const [tabName, CentralPaneNames] of Object.entries(TAB_TO_CENTRAL_PANE_MAPPING)) {
        for (const CentralPaneName of CentralPaneNames) {
            mapping[CentralPaneName] = tabName as SplitNavigatorScreenName;
        }
    }
    return mapping;
};

const CENTRAL_PANE_TO_TAB_MAPPING: Record<SplitNavigatorScreenName, SplitNavigatorScreenName> = generateCentralPaneToTabMapping();

export {CENTRAL_PANE_TO_TAB_MAPPING};
export default TAB_TO_CENTRAL_PANE_MAPPING;
