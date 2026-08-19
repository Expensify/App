import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import useOnyx from './useOnyx';

type TwoFactorAuthRouteOptions = {
    forceSetup?: boolean;
};

type TwoFactorAuthRouteResult = {
    getTwoFactorAuthRoute: (backTo?: Route, options?: TwoFactorAuthRouteOptions) => Route;
    is2FAEnabled: boolean;
};

/**
 * Returns the 2FA enabled state and a getter that resolves the correct 2FA route based on account state:
 * - 2FA already enabled  → static enabled page
 * - user not validated   → dynamic verify-account page
 * - otherwise            → dynamic setup (copy codes) page
 * @returns An object containing:
 *  - `getTwoFactorAuthRoute`: a function `(backTo?: Route) => Route` that computes the target route.
 *  - `is2FAEnabled`: whether the user already has 2FA enabled.
 */
function useTwoFactorAuthRoute(): TwoFactorAuthRouteResult {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const is2FAEnabled = !!account?.requiresTwoFactorAuth;

    const getTwoFactorAuthRoute = (backTo?: Route, options?: TwoFactorAuthRouteOptions): Route => {
        if (is2FAEnabled && !options?.forceSetup) {
            return ROUTES.SETTINGS_2FA_ENABLED;
        }

        if (!account?.validated) {
            return createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path, backTo);
        }

        return createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path, backTo);
    };

    return {getTwoFactorAuthRoute, is2FAEnabled};
}

export default useTwoFactorAuthRoute;
