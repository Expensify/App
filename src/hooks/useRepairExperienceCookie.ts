/**
 * On expensify.com an `experience` cookie set to `new` sends the user to New Expensify, so Expensify Classic, which keeps the cookie in sync with the account,
 * never gets a chance to correct it. Once the server's data arrives after start, this opens Classic when the account no longer uses New Expensify there,
 * because the account switched to Classic elsewhere or left the beta. Classic then rewrites the cookie from the account's settings.
 */
import {clearExperienceCookie, isSharedProductHost, readExperienceCookie} from '@libs/ExperienceCookie';
import Log from '@libs/Log';
import {shouldUseOldApp} from '@libs/TryNewDotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isDelegateSessionSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

import useIsSupportalSession from './useIsSupportalSession';
import useOnyx from './useOnyx';
import useOpenClassic from './useOpenClassic';
import usePermissions from './usePermissions';

/**
 * Marks that this tab opened Classic to repair the cookie. Returns false when a repair already ran in this tab or the mark can't be stored,
 * because Classic and New Expensify could disagree about the account and send the tab back and forth.
 */
function claimRepairInThisTab(): boolean {
    // Reading sessionStorage throws when the browser blocks storage, so the probe stays inside the try
    try {
        if (typeof sessionStorage === 'undefined') {
            Log.hmmm('[ExperienceCookie] Not repairing the cookie because sessionStorage is unavailable');
            return false;
        }
        if (sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.EXPERIENCE_COOKIE_REPAIR) !== null) {
            Log.hmmm('[ExperienceCookie] Not repairing the cookie again in this tab, Classic and New Expensify may disagree about the account');
            return false;
        }
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.EXPERIENCE_COOKIE_REPAIR, String(Date.now()));
        return true;
    } catch (error) {
        Log.hmmm('[ExperienceCookie] Not repairing the cookie because sessionStorage failed', {error: String(error)});
        return false;
    }
}

/** A start that keeps the user in New Expensify ends any back and forth, so the next mismatch in this tab can be repaired again */
function releaseRepairInThisTab() {
    try {
        if (typeof sessionStorage === 'undefined') {
            return;
        }
        sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.EXPERIENCE_COOKIE_REPAIR);
    } catch {
        // A mark that can't be removed only blocks a later repair in this tab, which leaves the cookie as it would be without this hook
    }
}

function useRepairExperienceCookie() {
    const [hasFreshAppData] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_FRESH_APP_DATA);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [hasBetaConfiguration = false] = useOnyx(ONYXKEYS.BETA_CONFIGURATION, {selector: (betaConfiguration) => !!betaConfiguration});
    const [isDelegateSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isDelegateSessionSelector});
    const isSupportalSession = useIsSupportalSession();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const openClassic = useOpenClassic();

    // Only the first server response for an account decides. Later changes in this session come from the user's own switch, which opens Classic itself.
    const hasDecided = useRef(false);

    useEffect(() => {
        // Clearing Onyx, as an account switch does, resets the flag, so the next account's first response decides again
        if (!hasFreshAppData) {
            hasDecided.current = false;
            return;
        }
        if (hasDecided.current || !isSharedProductHost()) {
            return;
        }
        hasDecided.current = true;

        // The cookie of a Supportal or Copilot session belongs to the agent, and Classic doesn't redirect agents either
        if (isSupportalSession || isDelegateSession) {
            releaseRepairInThisTab();
            return;
        }

        // Explicit-only betas are told apart only once the beta configuration loads, so the account must not be treated as outside the beta before that
        const isInBeta = hasBetaConfiguration ? isBetaEnabledOrUnknown(CONST.BETAS.HYBRID_WEB) : undefined;
        const cookie = readExperienceCookie();
        const shouldUseClassic = shouldUseOldApp(tryNewDot ?? {});

        // Only a `new` cookie keeps the user away from Classic. Without it, the user opened a New Expensify link on purpose, and Classic handles the cookie on the next visit.
        const isOutsideBeta = isInBeta === false;
        const prefersClassic = isInBeta === true && shouldUseClassic === true;
        if (cookie !== CONST.EXPERIENCE_COOKIE.VALUES.NEW || (!isOutsideBeta && !prefersClassic)) {
            releaseRepairInThisTab();
            return;
        }

        if (!claimRepairInThisTab()) {
            return;
        }

        Log.info('[ExperienceCookie] Opening Classic to repair the experience cookie', false, {cookie, isInBeta, shouldUseClassic});
        if (isOutsideBeta) {
            clearExperienceCookie();
        }
        openClassic();
    }, [hasFreshAppData, tryNewDot, hasBetaConfiguration, isDelegateSession, isSupportalSession, isBetaEnabledOrUnknown, openClassic]);
}

export default useRepairExperienceCookie;
