/**
 * Opens Expensify Classic and marks the HybridWeb experience cookie first when the account may use it, so the router keeps serving Classic.
 */
import {writeExperienceCookie} from '@libs/ExperienceCookie';

import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isDelegateSessionSelector} from '@selectors/Session';

import useIsSupportalSession from './useIsSupportalSession';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useOpenClassic(): () => void {
    const {isBetaEnabled} = usePermissions();
    const isSupportalSession = useIsSupportalSession();
    const [isDelegateSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isDelegateSessionSelector});

    // Agents share the browser with their own account, so a Supportal or Copilot session must not overwrite the agent's cookie, matching Web-Expensify
    const shouldMarkExperienceClassic = isBetaEnabled(CONST.BETAS.HYBRID_WEB) && !isSupportalSession && !isDelegateSession;

    return () => {
        if (shouldMarkExperienceClassic) {
            writeExperienceCookie(CONST.EXPERIENCE_COOKIE.VALUES.CLASSIC);
        }
        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
    };
}

export default useOpenClassic;
