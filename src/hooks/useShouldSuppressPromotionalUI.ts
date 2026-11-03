import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {isActingAsDelegateSelector} from '@selectors/Account';
import {isSupportalSessionSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/**
 * Returns true when promo, training, and onboarding UI should be hidden (supportal or copilot session).
 * Each subscription is narrowed to the derived boolean so consumers only re-render when suppression actually changes.
 * Fails closed: while SESSION or ACCOUNT is still loading we suppress, so a supportal/copilot session is never briefly
 * treated as a normal one (e.g. a copilot could otherwise be reset into onboarding before delegatedAccess.delegate loads).
 */
function useShouldSuppressPromotionalUI(): boolean {
    const [isSupportalSession = false, sessionMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});
    const [isActingAsDelegate = false, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});

    if (isLoadingOnyxValue(sessionMetadata, accountMetadata)) {
        return true;
    }

    return isSupportalSession || isActingAsDelegate;
}

export default useShouldSuppressPromotionalUI;
