/**
 * On expensify.com the router sends a user whose `experience` cookie is `new` to New Expensify, and only Expensify Classic
 * updates the cookie from the account's settings. When the account stops using New Expensify elsewhere or leaves the beta,
 * the user never reaches Classic, so after the server's first response this opens Classic once to let it rewrite the cookie.
 */
import {useInitialURLState} from '@components/InitialURLContextProvider';

import {clearExperienceCookie, isSharedProductHost, readExperienceCookie} from '@libs/ExperienceCookie';
import Log from '@libs/Log';
import {shouldUseClassicOnWeb} from '@libs/TryNewDotUtils';
import {hasSecureLinkKey} from '@libs/Url';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isDelegateSessionSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

import useIsAnonymousUser from './useIsAnonymousUser';
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
    const [hasQueuedRequests = false] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {selector: (requests) => !!requests?.length});
    const [hasOngoingRequest = false] = useOnyx(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, {selector: (request) => !!request});
    const isSupportalSession = useIsSupportalSession();
    const isAnonymousSession = useIsAnonymousUser();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const openClassic = useOpenClassic();
    const {initialURL} = useInitialURLState();

    // Only the first server response for an account decides, so the user is never sent to Classic in the middle of a session
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

        // In a Supportal, Copilot or anonymous session the cookie isn't the signed-in account's, so it is left as it is
        const isCookieFromOtherUser = isSupportalSession || isDelegateSession || isAnonymousSession;

        // The beta is known only once the betas and the beta configuration load, so the account must not be treated as outside the beta before that
        const isInBeta = hasBetaConfiguration ? isBetaEnabledOrUnknown(CONST.BETAS.HYBRID_WEB) : undefined;
        const cookie = readExperienceCookie();
        const shouldUseClassic = shouldUseClassicOnWeb(tryNewDot);

        // Only a `new` cookie keeps the user away from Classic. Without it, the user opened a New Expensify link on purpose, and Classic handles the cookie on the next visit.
        const isOutsideBeta = isInBeta === false;
        const prefersClassic = isInBeta === true && shouldUseClassic;
        // A secure link must reach its report. The URL the app opened with is checked, because the report screen removes the key from the current one.
        const isOpenedViaSecureLink = hasSecureLinkKey(initialURL);
        const shouldRepair = !isCookieFromOtherUser && !isOpenedViaSecureLink && cookie === CONST.EXPERIENCE_COOKIE.VALUES.NEW && (isOutsideBeta || prefersClassic);

        // Opening Classic leaves this page, so it waits while requests, such as changes made offline, are still queued
        if (shouldRepair && (hasQueuedRequests || hasOngoingRequest)) {
            return;
        }
        hasDecided.current = true;

        if (!shouldRepair) {
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
    }, [
        hasFreshAppData,
        tryNewDot,
        hasBetaConfiguration,
        isDelegateSession,
        isSupportalSession,
        isAnonymousSession,
        initialURL,
        isBetaEnabledOrUnknown,
        openClassic,
        hasQueuedRequests,
        hasOngoingRequest,
    ]);
}

export default useRepairExperienceCookie;
