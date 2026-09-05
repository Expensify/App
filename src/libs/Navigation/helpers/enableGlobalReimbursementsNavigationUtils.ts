/**
 * Route helpers for Enable Global Reimbursements in wallet settings or on search and report screens.
 */
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from './dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './dynamicRoutesUtils/getPathWithoutDynamicSuffix';

type EnableGlobalReimbursementsRouteParams = {
    bankCountry?: string;
    bankCurrency?: string;
};

const ENABLE_GLOBAL_REIMBURSEMENTS_SUFFIX_PATTERNS: DynamicRouteSuffix[] = [
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.path,
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.path,
    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.path,
];

function getDynamicBasePathFromNavigationPath(path: string | undefined): string {
    if (!path) {
        return ROUTES.HOME;
    }

    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    for (const pattern of ENABLE_GLOBAL_REIMBURSEMENTS_SUFFIX_PATTERNS) {
        const match = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash).find((suffixMatch) => suffixMatch.pattern === pattern);
        if (match) {
            return getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
        }
    }

    return pathWithoutLeadingSlash;
}

function getEnableGlobalReimbursementsRootBackPath(dynamicBasePath: string): Route {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime path from getPathFromState; caller must validate with shouldUseDynamicEnableGlobalReimbursementsBase first
    return dynamicBasePath as Route;
}

function shouldUseDynamicEnableGlobalReimbursementsBase(basePath: string): boolean {
    const pathWithoutQuery = basePath.split('?').at(0) ?? '';

    if (!pathWithoutQuery || pathWithoutQuery.includes('enable-global-reimbursements')) {
        return false;
    }

    return pathWithoutQuery.startsWith('search/') || pathWithoutQuery.startsWith('r/') || pathWithoutQuery === 'home' || pathWithoutQuery === 'settings/wallet';
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

export {
    getDynamicBasePathFromNavigationPath,
    getEnableGlobalReimbursementsBusinessNavigationRoute,
    getEnableGlobalReimbursementsRootBackPath,
    shouldUseDynamicEnableGlobalReimbursementsBase,
};
