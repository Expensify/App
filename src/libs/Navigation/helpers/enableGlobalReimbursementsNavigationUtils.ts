/**
 * Route helpers for Enable Global Reimbursements in wallet settings or on search and report screens.
 */
import Log from '@libs/Log';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

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
]);

const ENABLE_GLOBAL_REIMBURSEMENTS_PATH_PREFIX = DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.path.split('/').at(0) ?? '';

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

function shouldUseDynamicEnableGlobalReimbursementsBase(basePath: string): boolean {
    const pathWithoutQuery = basePath.split('?').at(0) ?? '';

    if (!pathWithoutQuery || pathWithoutQuery.includes(ENABLE_GLOBAL_REIMBURSEMENTS_PATH_PREFIX)) {
        return false;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- path parsed to verify focused route name against entry screens
        const focusedRouteName = findFocusedRouteWithOnyxTabGuard(getStateFromPath(pathWithoutQuery as Route) ?? {})?.name;
        if (focusedRouteName && ENABLE_GLOBAL_REIMBURSEMENTS_ENTRY_SCREENS.has(focusedRouteName)) {
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

export type {EnableGlobalReimbursementsRouteParams};
export {
    getDynamicBasePathFromNavigationPath,
    getEnableGlobalReimbursementsBusinessNavigationRoute,
    getEnableGlobalReimbursementsRootBackPath,
    shouldUseDynamicEnableGlobalReimbursementsBase,
};
