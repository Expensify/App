import ONYXKEYS from '@src/ONYXKEYS';

import {shouldSuppressPromotionalUISelector} from '@selectors/PromotionalUI';

import useOnyx from './useOnyx';

/**
 * Returns true when promo, training, and onboarding UI should be hidden (supportal or copilot session).
 */
function useShouldSuppressPromotionalUI(): boolean {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    return shouldSuppressPromotionalUISelector(session, account);
}

export default useShouldSuppressPromotionalUI;
