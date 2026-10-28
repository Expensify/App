/**
 * Route helpers for Enable Global Reimbursements in wallet settings or on search and report screens.
 */
import Log from '@libs/Log';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from './dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import findFocusedRouteWithOnyxTabGuard from './findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from './getStateFromPath';

type EnableGlobalReimbursementsRouteParams = {
    /** The country of the bank account */
    bankCountry?: string;

    /** The currency of the bank account */
    bankCurrency?: string;
};

const ENABLE_GLOBAL_REIMBURSEMENTS_SUFFIX_PATTERNS = new Set<string>([
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.path,
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.path,
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.path,
    DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path,
]);

const ENABLE_GLOBAL_REIMBURSEMENTS_PATH_PREFIXES = [
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.path.split('/').at(0) ?? '',
    DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path.split('/').at(0) ?? '',
];

function getDynamicBasePathFromNavigationPath(path: string | undefined): string {
    if (!path) {
        return ROUTES.HOME;
    }

    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    const suffixMatches = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash);
    const match = suffixMatches.find((suffixMatch) => ENABLE_GLOBAL_REIMBURSEMENTS_SUFFIX_PATTERNS.has(suffixMatch.pattern));
    if (match) {
        return getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
    }

    return pathWithoutLeadingSlash;
}

function getEnableGlobalReimbursementsRootBackPath(dynamicBasePath: string): Route {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime path from getPathFromState; caller must validate with shouldUseDynamicEnableGlobalReimbursementsBase first
    return dynamicBasePath as Route;
}

const ENABLE_GLOBAL_REIMBURSEMENTS_ENTRY_SCREENS = new Set<string>(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.entryScreens);

const WISE_GLOBAL_REIMBURSEMENTS_INTRO_ENTRY_SCREENS = new Set<string>(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.entryScreens);

// The wallet and workspace workflows are excluded because they are banner entry points, and the wallet is also the fallback when a pay signal arrives elsewhere
const BANNER_ONLY_ENTRY_SCREENS = new Set<string>([SCREENS.SETTINGS.WALLET.ROOT, SCREENS.WORKSPACE.WORKFLOWS]);
const PAY_REPORT_ENTRY_SCREENS = new Set<string>(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.entryScreens.filter((screen) => !BANNER_ONLY_ENTRY_SCREENS.has(screen)));

function shouldUseDynamicEnableGlobalReimbursementsBase(basePath: string, entryScreens: Set<string> = ENABLE_GLOBAL_REIMBURSEMENTS_ENTRY_SCREENS): boolean {
    const pathWithoutQuery = basePath.split('?').at(0) ?? '';

    if (!pathWithoutQuery || ENABLE_GLOBAL_REIMBURSEMENTS_PATH_PREFIXES.some((prefix) => pathWithoutQuery.includes(prefix))) {
        return false;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- path parsed to verify focused route name against entry screens
        const focusedRouteName = findFocusedRouteWithOnyxTabGuard(getStateFromPath(pathWithoutQuery as Route) ?? {})?.name;
        if (focusedRouteName && entryScreens.has(focusedRouteName)) {
            return true;
        }
    } catch (error) {
        Log.warn('shouldUseDynamicEnableGlobalReimbursementsBase: failed to resolve route state from path', {basePath, error: error instanceof Error ? error.message : String(error)});
        return false;
    }

    return false;
}

function getEnableGlobalReimbursementsBusinessNavigationRoute(
    bankAccountID: number,
    subPage: string,
    params?: EnableGlobalReimbursementsRouteParams,
    navigationPathAtSignal?: string,
): Route {
    const basePath = navigationPathAtSignal ? getDynamicBasePathFromNavigationPath(navigationPathAtSignal) : undefined;

    if (basePath && shouldUseDynamicEnableGlobalReimbursementsBase(basePath)) {
        return createDynamicRoute(DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(String(bankAccountID), subPage, undefined, params), basePath);
    }

    return ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(bankAccountID, subPage, undefined, params);
}

function getWiseGlobalReimbursementsIntroNavigationRoute(bankAccountID: number, navigationPathAtSignal?: string, isPayingMultipleReports?: boolean): Route {
    const basePath = navigationPathAtSignal ? getDynamicBasePathFromNavigationPath(navigationPathAtSignal) : undefined;
    const introRoute = DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID, isPayingMultipleReports);

    if (basePath && shouldUseDynamicEnableGlobalReimbursementsBase(basePath, WISE_GLOBAL_REIMBURSEMENTS_INTRO_ENTRY_SCREENS)) {
        return createDynamicRoute(introRoute, basePath);
    }

    return createDynamicRoute(introRoute, ROUTES.SETTINGS_WALLET);
}

/** Whether the intro was opened over a report or search screen, which means the admin got there by paying a report */
function isWiseGlobalReimbursementsIntroOverPayReportScreen(introBackPath: string): boolean {
    return shouldUseDynamicEnableGlobalReimbursementsBase(introBackPath, PAY_REPORT_ENTRY_SCREENS);
}

export type {EnableGlobalReimbursementsRouteParams};
export {
    getDynamicBasePathFromNavigationPath,
    getEnableGlobalReimbursementsBusinessNavigationRoute,
    getEnableGlobalReimbursementsRootBackPath,
    getWiseGlobalReimbursementsIntroNavigationRoute,
    isWiseGlobalReimbursementsIntroOverPayReportScreen,
    shouldUseDynamicEnableGlobalReimbursementsBase,
};
