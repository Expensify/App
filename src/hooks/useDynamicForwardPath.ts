import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {State} from '@libs/Navigation/types';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import useRootNavigationState from './useRootNavigationState';

/**
 * Maps a dynamic route suffix + entry screen pair to a forward navigation route.
 *
 * Structure:
 *   {
 *     [dynamicSuffix]: {            // e.g. 'verify-account' from DYNAMIC_ROUTES
 *       [entryScreen]: forwardRoute  // e.g. SCREENS.SETTINGS.WALLET.ROOT → ROUTES.SETTINGS_ENABLE_PAYMENTS
 *     }
 *   }
 *
 * - dynamicSuffix: The path suffix registered in DYNAMIC_ROUTES (e.g. 'verify-account').
 * - entryScreen: The screen that the dynamic suffix is appended to (e.g. 'Settings_Wallet').
 * - forwardRoute: The destination route to navigate forward to from the dynamic route page.
 */
const FORWARD_TO_MAPPINGS: Record<string, Record<string, Route>> = {
    [DYNAMIC_ROUTES.VERIFY_ACCOUNT.path]: {
        [SCREENS.SETTINGS.WALLET.ROOT]: ROUTES.SETTINGS_ENABLE_PAYMENTS,
        [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.route,
    },
    [DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path]: {
        [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: ROUTES.SETTINGS_SECURITY,
    },
    [DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path]: {
        [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: ROUTES.SETTINGS_SECURITY,
    },
    [DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path]: {
        [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: ROUTES.SETTINGS_SECURITY,
    },
    [DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path]: {
        [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: ROUTES.SETTINGS_SECURITY,
    },
};

/**
 * Resolves a forward navigation path for the current dynamic route.
 *
 * Determines the dynamic suffix and entry screen from the current URL,
 * then looks up the corresponding forward path in FORWARD_TO_MAPPINGS.
 *
 * @returns The forward route if a mapping exists for the current (suffix, entryScreen) pair, undefined otherwise.
 */
function useDynamicForwardPath(): Route | undefined {
    const path = useRootNavigationState((state) => {
        if (!state) {
            return undefined;
        }

        return getPathFromState(state as State);
    });

    if (!path) {
        return undefined;
    }

    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    const match = findMatchingDynamicSuffix(pathWithoutLeadingSlash);
    if (!match) {
        return undefined;
    }

    const suffixMappings = FORWARD_TO_MAPPINGS[match.pattern];
    if (!suffixMappings) {
        return undefined;
    }

    const basePath = getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, match.actualSuffix, match.pattern);
    const baseState = getStateFromPath(basePath as Route);
    if (!baseState) {
        return undefined;
    }

    const focusedRoute = findFocusedRouteWithOnyxTabGuard(baseState);
    if (!focusedRoute) {
        return undefined;
    }

    return suffixMappings[focusedRoute.name];
}

export default useDynamicForwardPath;
