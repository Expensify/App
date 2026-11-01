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

/** Resolves the pending challenge after the user passes the Turnstile check. */
function resolveCloudflareChallenge() {
    setIsCloudflareChallengeModalOpen(false);
    challengeResolution?.resolve();
    challengeResolution = undefined;
}

/**
 * Waits for the user to pass the Cloudflare challenge. Shows the Turnstile modal, and every request challenged
 * while the check is pending waits on the same promise. Rejects when the challenge cannot be solved, so the
 * caller fails the request the same way as before this handling existed.
 */
function requestCloudflareChallengeResolution(): Promise<void> {
    if (challengeResolution) {
        return challengeResolution.promise;
    }
    // Only browsers can render the Turnstile widget, and the native cookie jar cannot hold the cf_clearance cookie
    if (getPlatform() !== CONST.PLATFORM.WEB || !isChallengeModalMounted) {
        return Promise.reject(createUnsolvedChallengeError());
    }
    challengeResolution = Promise.withResolvers<void>();
    setIsCloudflareChallengeModalOpen(true);
    return challengeResolution.promise;
}

export {rejectCloudflareChallenge, requestCloudflareChallengeResolution, resolveCloudflareChallenge, setIsChallengeModalMounted};
