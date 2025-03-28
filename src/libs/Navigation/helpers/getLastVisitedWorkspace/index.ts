/* eslint-disable @typescript-eslint/naming-convention */
import SCREENS from "@src/SCREENS";
import CONST from '@src/CONST';
import getIsNarrowLayout from "@libs/getIsNarrowLayout";


const workspaceScreenNames : Record<string, string> = {
    'default': SCREENS.WORKSPACE.INITIAL,
    'overview': SCREENS.WORKSPACE.PROFILE,
    'members': SCREENS.WORKSPACE.MEMBERS,
    'distance-rates': SCREENS.WORKSPACE.DISTANCE_RATES,
    'expensify-card': SCREENS.WORKSPACE.EXPENSIFY_CARD,
    'company-cards': SCREENS.WORKSPACE.COMPANY_CARDS,
    'per-diem': SCREENS.WORKSPACE.PER_DIEM,
    'workflows': SCREENS.WORKSPACE.WORKFLOWS,
    'rules': SCREENS.WORKSPACE.RULES,
    'invoices': SCREENS.WORKSPACE.INVOICES,
    'categories': SCREENS.WORKSPACE.CATEGORIES,
    'tags': SCREENS.WORKSPACE.TAGS,
    'taxes': SCREENS.WORKSPACE.TAXES,
    'reportFields': SCREENS.WORKSPACE.REPORT_FIELDS,
    'accounting': SCREENS.WORKSPACE.ACCOUNTING.ROOT,
    'more-features': SCREENS.WORKSPACE.MORE_FEATURES
};

function savePathToSessionStorage(url:string) {
    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_SETTINGS_PATH, url);
}

function getWorkspaceScreenNameKey(url:string) : string{
    const parts = url.split('/');
    return parts.filter(Boolean).pop() ?? '';
}

function getLastVisitedSettingsPath() : string {
    const lastVisitedSettingsPath = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_SETTINGS_PATH);
    return lastVisitedSettingsPath ?? '';
}

function getWorkspaceScreenName(key:string) : string{
    return workspaceScreenNames[key] ?? '';
}

function getLastVisitedWorkspaceScreen() {
    const lastVisitedSettingsPath = getLastVisitedSettingsPath();
    const key = getWorkspaceScreenNameKey(lastVisitedSettingsPath);
    const workspaceScreenName = getWorkspaceScreenName(key);
    return !getIsNarrowLayout() && workspaceScreenName ? workspaceScreenName : SCREENS.WORKSPACE.INITIAL; 
}

export { getLastVisitedWorkspaceScreen, savePathToSessionStorage, getLastVisitedSettingsPath};
