import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useNavigationState} from '@react-navigation/native';

/**
 * Whether "Join a workspace" should hide its Back button.
 *
 * Shared by the screen itself and by the Android hardware-back handler in `index.native.tsx`, so the header button and
 * the system gesture can never disagree about whether going back is possible.
 */
function useShouldHideBackButton(backTo?: string): boolean {
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);

    // Two flows force-replace into this screen — the work email merge and the private domain screen — and a replace
    // discards every route before it. Asking the onboarding stack how many routes it holds answers "is there anything
    // to go back to" directly, rather than inferring it from onboarding state that cannot distinguish the entry point
    // from a later visit. `canGoBack()` cannot answer this: it bubbles up to the root stack, which can always pop the
    // whole onboarding modal, so it is `true` even when this screen is the only onboarding route.
    const isOnlyRouteInOnboardingStack = useNavigationState((state) => state.routes.length === 1);

    return (onboardingValues?.shouldValidate === false && backTo === ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()) || isOnlyRouteInOnboardingStack;
}

export default useShouldHideBackButton;
