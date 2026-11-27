/**
 * A browser with the `experience` cookie uses the shared host. When it opens New Expensify on New Expensify's own host,
 * this moves the page to the same path on the shared host and carries the session over with a short-lived token.
 */
import {getCachedEnvironmentURL} from '@libs/Environment/Environment';
import {getSharedProductOrigin, hasSharedHostBrake, readExperienceCookie} from '@libs/ExperienceCookie';
import Log from '@libs/Log';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import {getIsOffline} from '@libs/NetworkState';

import {getShortLivedAuthToken} from '@userActions/Link';
import {getAllIncludingOngoing as getAllPersistedRequests, waitForInitialization as waitForPersistedRequests} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isAnonymousSessionSelector, isDelegateSessionSelector, isSupportalSessionSelector} from '@selectors/Session';
import Onyx from 'react-native-onyx';

import type {HopToSharedHost, ShouldHopToSharedHost} from './types';

function isLegacyAppHost(): boolean {
    return window.location.origin === new URL(getCachedEnvironmentURL()).origin;
}

/**
 * Whether this tab left for the shared host recently. A page that comes back to this host soon after means the shared host sent it here,
 * and hopping again would loop. Blocked storage and a mark that isn't a timestamp both count as a recent mark.
 */
function hasHoppedInThisTab(): boolean {
    try {
        const mark = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP);
        if (mark === null) {
            return false;
        }
        if (!/^\d+$/.test(mark)) {
            return true;
        }
        return Date.now() - Number(mark) < CONST.LEGACY_HOST_HOP.TAB_GUARD_DURATION_MS;
    } catch {
        return true;
    }
}

/** Marks that this tab is leaving for the shared host. Returns false when the mark can't be stored. */
function markHopInThisTab(): boolean {
    try {
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.SHARED_HOST_HOP, String(Date.now()));
        return true;
    } catch (error) {
        Log.hmmm('[LegacyHostHop] Not moving to the shared host because sessionStorage failed', {error: String(error)});
        return false;
    }
}

type SessionWatch = {
    /** Resolves once the watch has seen the live session. From then on it gets each session value Onyx delivers, which is where the request takes its token from. */
    waitUntilWatching: () => Promise<void>;

    /** Whether every session seen so far was a signed in, ordinary session of the checked account */
    hasOnlySeenCheckedAccount: () => boolean;

    stop: () => void;
};

/**
 * The token request authenticates with whichever session is live when it is sent, and another tab can change that session through Onyx.
 * A renewed token for the same account is fine, but a Copilot session gets its own long-lived token back, so any other session seen while waiting means the token can't go into a URL.
 */
function watchSession(checkedSession: Session): SessionWatch {
    let hasOnlySeenCheckedAccount = true;
    let resolveWatching: () => void = () => {};
    const watching = new Promise<void>((resolve) => {
        resolveWatching = resolve;
    });

    // Uses connectWithoutView because this runs outside React and has to see each session value the request could be sent with, while a render only sees the latest one
    const connection = Onyx.connectWithoutView({
        key: ONYXKEYS.SESSION,
        callback: (liveSession: OnyxEntry<Session>) => {
            // Without an account ID on the checked session, no live session can be confirmed as the same account
            const isCheckedAccount = !!liveSession?.authToken && checkedSession.accountID !== undefined && liveSession.accountID === checkedSession.accountID;
            if (!isCheckedAccount || isSupportalSessionSelector(liveSession) || isDelegateSessionSelector(liveSession)) {
                hasOnlySeenCheckedAccount = false;
            }
            resolveWatching();
        },
    });

    return {
        waitUntilWatching: () => watching,
        hasOnlySeenCheckedAccount: () => hasOnlySeenCheckedAccount,
        stop: () => connection.unsubscribe(),
    };
}

function buildTransitionURL(origin: string, shortLivedAuthToken: string, email: string | undefined, exitTo: string): string {
    const params = new URLSearchParams({shortLivedAuthToken});
    if (email) {
        params.set('email', email);
    }
    if (exitTo) {
        params.set('exitTo', exitTo);
    }
    return `${origin}/${ROUTES.TRANSITION_BETWEEN_APPS}?${params.toString()}`;
}

/**
 * Leaving drops requests that haven't reached the server, so the token is fetched only once the queue has drained.
 * The request also waits for the session watch, so the session it is sent with is one the watch has seen.
 */
async function getShortLivedAuthTokenAfterQueue(sessionWatch: SessionWatch, hasTimedOut: () => boolean): Promise<string | undefined> {
    await waitForPersistedRequests();
    await waitForIdle();
    await sessionWatch.waitUntilWatching();
    if (hasTimedOut()) {
        return undefined;
    }
    if (!sessionWatch.hasOnlySeenCheckedAccount()) {
        Log.info('[LegacyHostHop] Staying on this host because the session changed before the short-lived token was requested');
        return undefined;
    }
    if (getIsOffline() || getAllPersistedRequests().length > 0) {
        Log.info('[LegacyHostHop] Staying on this host because queued requests have not been sent');
        return undefined;
    }
    return getShortLivedAuthToken();
}

/** Resolves to undefined after the timeout, so a slow queue or token request never holds startup */
function getShortLivedAuthTokenWithTimeout(sessionWatch: SessionWatch): Promise<string | undefined> {
    let timeoutID: ReturnType<typeof setTimeout> | undefined;
    let hasTimedOut = false;
    const timeout = new Promise<undefined>((resolve) => {
        timeoutID = setTimeout(() => {
            hasTimedOut = true;
            Log.hmmm('[LegacyHostHop] Staying on this host because the queue or the short-lived token took too long');
            resolve(undefined);
        }, CONST.LEGACY_HOST_HOP.TIMEOUT_MS);
    });
    return Promise.race([getShortLivedAuthTokenAfterQueue(sessionWatch, () => hasTimedOut), timeout]).finally(() => clearTimeout(timeoutID));
}

const shouldHopToSharedHost: ShouldHopToSharedHost = () => {
    if (!isLegacyAppHost() || !readExperienceCookie()) {
        return false;
    }
    if (hasSharedHostBrake()) {
        Log.info('[LegacyHostHop] Staying on this host because the router asked this browser to stay off the shared host');
        return false;
    }
    if (hasHoppedInThisTab()) {
        Log.hmmm('[LegacyHostHop] Staying on this host because this tab already left for the shared host');
        return false;
    }
    return !!getSharedProductOrigin();
};

const hopToSharedHost: HopToSharedHost = async (session) => {
    const origin = getSharedProductOrigin();
    if (!origin || !shouldHopToSharedHost()) {
        return false;
    }

    // OpenOldDotLink fails for Supportal and returns a Copilot session's long-lived token, which must not go into a URL
    if (isSupportalSessionSelector(session) || isDelegateSessionSelector(session)) {
        Log.info('[LegacyHostHop] Staying on this host in a Supportal or Copilot session');
        return false;
    }
    if (!markHopInThisTab()) {
        return false;
    }

    const {pathname, search, hash} = window.location;

    // A /transition link carries its own token, and a signed out page needs no session, so both move as they are
    const isTransitionLink = pathname === `/${ROUTES.TRANSITION_BETWEEN_APPS}`;
    if (!session?.authToken || isAnonymousSessionSelector(session) || isTransitionLink) {
        Log.info('[LegacyHostHop] Moving to the shared host without a token', false, {isTransitionLink});
        window.location.replace(`${origin}${pathname}${search}${hash}`);
        return true;
    }

    // Offline, the queue can't drain and no token can be fetched
    if (getIsOffline()) {
        Log.info('[LegacyHostHop] Staying on this host while offline');
        return false;
    }

    const sessionWatch = watchSession(session);
    try {
        // A token that arrives after the timeout is dropped here, because only the race's result can navigate
        const shortLivedAuthToken = await getShortLivedAuthTokenWithTimeout(sessionWatch);
        if (!shortLivedAuthToken) {
            Log.hmmm('[LegacyHostHop] Staying on this host without a short-lived token');
            return false;
        }
        if (!sessionWatch.hasOnlySeenCheckedAccount()) {
            Log.info('[LegacyHostHop] Staying on this host because the session changed while the short-lived token was fetched');
            return false;
        }

        Log.info('[LegacyHostHop] Moving to the shared host with a short-lived token');
        window.location.replace(buildTransitionURL(origin, shortLivedAuthToken, session.email, `${pathname.slice(1)}${search}`));
        return true;
    } finally {
        sessionWatch.stop();
    }
};

export {shouldHopToSharedHost, hopToSharedHost};
