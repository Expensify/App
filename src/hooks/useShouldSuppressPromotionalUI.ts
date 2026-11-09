import ONYXKEYS from '@src/ONYXKEYS';

import {isActingAsDelegateSelector} from '@selectors/Account';
import {isSupportalSessionSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/**
 * Returns true when promo, training, and onboarding UI should be hidden (supportal or copilot session).
 * Each subscription is narrowed to the derived boolean so consumers only re-render when suppression actually changes.
 */
function useShouldSuppressPromotionalUI(): boolean {
    const [isSupportalSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});
    const [isActingAsDelegate = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});

    return isSupportalSession || isActingAsDelegate;
}

export default useShouldSuppressPromotionalUI;
