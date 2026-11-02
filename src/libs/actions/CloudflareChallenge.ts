/**
 * Coordinates the Cloudflare challenge: shows the Turnstile modal and settles every request that was challenged
 * while the check was pending.
 */
import HttpsError from '@libs/Errors/HttpsError';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

let challengeResolution: ReturnType<typeof Promise.withResolvers<void>> | undefined;

// Cloudflare keeps challenging requests until the cf_clearance cookie rides along, so once the check passes every
// later request must send cookies. The flag lives for the session, because the cookie itself expires.
let hasClearedChallenge = false;

// The modal lives in GlobalModals, which mounts once navigation is ready. Requests challenged before that cannot show
// the widget, so they fail instead of waiting for a promise nothing would ever resolve.
let isChallengeModalMounted = false;

function setIsChallengeModalMounted(isMounted: boolean) {
    isChallengeModalMounted = isMounted;
}

function setIsCloudflareChallengeModalOpen(isOpen: boolean) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_IS_CLOUDFLARE_CHALLENGE_MODAL_OPEN, isOpen);
}

/** The error every request takes when its challenge cannot be solved, so it fails the same way as before this handling existed. */
function createUnsolvedChallengeError() {
    return new HttpsError({
        message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
        status: CONST.HTTP_STATUS.FORBIDDEN.toString(),
        title: 'Cloudflare challenge not solved',
    });
}

/** Rejects the pending challenge with an error matching the HTTP failure the challenge response represents. */
function rejectCloudflareChallenge() {
    setIsCloudflareChallengeModalOpen(false);
    challengeResolution?.reject(createUnsolvedChallengeError());
    challengeResolution = undefined;
}

/** The credentials mode new requests should use, based on whether a challenge was cleared this session. */
function getRequestCredentials(): RequestCredentials {
    return hasClearedChallenge ? 'same-origin' : 'omit';
}

/** Resolves the challenge every waiting request shares, because one passed check clears the rule for all of them. */
function resolveCloudflareChallenge() {
    hasClearedChallenge = true;
    setIsCloudflareChallengeModalOpen(false);
    challengeResolution?.resolve();
    challengeResolution = undefined;
}

/**
 * Waits for the user to pass the Cloudflare challenge. Shows the Turnstile modal, and every request challenged
 * while the check is pending waits on the same promise. Rejects when the challenge cannot be solved, so the
 * caller fails the request the same way as before this handling existed.
 */
function requestCloudflareChallengeResolution(challengedRequestURL: string): Promise<void> {
    // The widget needs a browser, and the native cookie jar cannot hold the cf_clearance cookie
    if (getPlatform() !== CONST.PLATFORM.WEB) {
        return Promise.reject(createUnsolvedChallengeError());
    }
    // A cross-origin request cannot be solved either. Cloudflare serves the challenge page without our CORS headers,
    // so such a request can never even read the header, and a third-party clearance cookie would not ride along on
    // later requests anyway.
    const isSameOriginRequest = new URL(challengedRequestURL, window.location.href).origin === window.location.origin;
    if (!isSameOriginRequest || !isChallengeModalMounted) {
        return Promise.reject(createUnsolvedChallengeError());
    }
    if (challengeResolution) {
        return challengeResolution.promise;
    }
    challengeResolution = Promise.withResolvers<void>();
    setIsCloudflareChallengeModalOpen(true);
    return challengeResolution.promise;
}

export {getRequestCredentials, rejectCloudflareChallenge, requestCloudflareChallengeResolution, resolveCloudflareChallenge, setIsChallengeModalMounted};
