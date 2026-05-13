import {useCallback} from 'react';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import useOnyx from './useOnyx';

/**
 * Returns a getter that resolves the correct 2FA route based on account state:
 * - 2FA already enabled  → static enabled page
 * - user not validated   → dynamic verify-account page
 * - otherwise            → dynamic setup (copy codes) page
 *
 * @returns A function `(backTo?: Route) => Route` that computes the target route.
 */
function useTwoFactorAuthRoute(): (backTo?: Route) => Route {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    return useCallback(
        (backTo?: Route): Route => {
            if (account?.requiresTwoFactorAuth) {
                return ROUTES.SETTINGS_2FA_ENABLED;
            }

            if (!account?.validated) {
                return createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path, backTo);
            }

            return createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path, backTo);
        },
        [account?.requiresTwoFactorAuth, account?.validated],
    );
}

export default useTwoFactorAuthRoute;
