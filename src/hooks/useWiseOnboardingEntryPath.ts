import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import useDynamicBackPath from './useDynamicBackPath';

/**
 * Returns the path of the screen that opened the Wise onboarding status page, read from the focused path without the Wise screens on top of it.
 * The status page and Wise's form over it get the same path whichever of them is focused, also when Wallet or Home opened the status page without the intro.
 */
function useWiseOnboardingEntryPath(): Route {
    const statusPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path);
    const introPath = stripDynamicRouteSuffixFromPath(statusPath, DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path);
    return stripDynamicRouteSuffixFromPath(introPath, DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
}

export default useWiseOnboardingEntryPath;
