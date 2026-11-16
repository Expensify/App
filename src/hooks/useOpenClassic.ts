/**
 * Opens Expensify Classic, first setting the `experience` cookie to `classic` when the account uses it, so expensify.com keeps serving Classic on later visits.
 */
import {isSharedProductHost, writeExperienceCookie} from '@libs/ExperienceCookie';

import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isDelegateSessionSelector} from '@selectors/Session';

import useIsSupportalSession from './useIsSupportalSession';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

// On expensify.com opening Classic always replaces this page, so once it starts, later requests in this page are dropped instead of opening Classic twice
let isOpeningClassicInThisPage = false;

function useOpenClassic(): () => void {
    const {isBetaEnabled} = usePermissions();
    const isSupportalSession = useIsSupportalSession();
    const [isDelegateSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isDelegateSessionSelector});

    // A Supportal or Copilot session runs in the agent's own browser, so it must not overwrite the cookie that belongs to the agent's account
    const shouldWriteExperienceCookie = isBetaEnabled(CONST.BETAS.HYBRID_WEB) && !isSupportalSession && !isDelegateSession;

    return () => {
        if (isOpeningClassicInThisPage) {
            return;
        }
        isOpeningClassicInThisPage = isSharedProductHost();

        if (shouldWriteExperienceCookie) {
            writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        }
        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
    };
}

export default useOpenClassic;
