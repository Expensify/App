import {useInitialURLState} from '@components/InitialURLContextProvider';

import {isLoggingInAsNewUser} from '@libs/SessionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import {isActingAsDelegateSelector} from '@selectors/Account';
import {emailSelector, isSupportalSessionSelector} from '@selectors/Session';

import useOnyx from './useOnyx';
import useRootNavigationState from './useRootNavigationState';

// Fails closed while navigation is not ready, so nothing promotional opens before the transition screen can be seen.
const isTransitionScreenOnTopSelector = (state: NavigationState | undefined) => !state || state.routes.at(-1)?.name === SCREENS.TRANSITION_BETWEEN_APPS;

/**
 * Returns true when promo, training, and onboarding UI should be hidden (supportal or copilot session, or a transition
 * link for another account waiting for the user to confirm the switch).
 * Each subscription is narrowed to the derived boolean so consumers only re-render when suppression actually changes.
 */
function useShouldSuppressPromotionalUI(): boolean {
    const [isSupportalSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});
    const [isActingAsDelegate = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {initialURL} = useInitialURLState();
    const isTransitionScreenOnTop = useRootNavigationState(isTransitionScreenOnTopSelector);

    // Promotional UI opened while the "Switch accounts?" prompt waits would sit next to it, for an account the user may be
    // about to leave. The launch URL is read rather than the current one because in-app navigation does not change it.
    // The prompt ends either with the link account signed in or with the transition screen left, and both lift this.
    const isWaitingForSwitchConfirmation = !!initialURL?.includes(ROUTES.TRANSITION_BETWEEN_APPS) && isTransitionScreenOnTop && isLoggingInAsNewUser(initialURL, sessionEmail);

    return isSupportalSession || isActingAsDelegate || isWaitingForSwitchConfirmation;
}

export default useShouldSuppressPromotionalUI;
