import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticate from '@libs/Reauthentication';
import type {ReauthenticationResult} from '@libs/Reauthentication';

import CONST from '@src/CONST';

let pendingReauthentication: Promise<ReauthenticationResult> | undefined;

/** Share image-triggered authentication so simultaneous failures do not start competing sign-in flows. */
function reauthenticateAttachmentImages(): Promise<ReauthenticationResult> {
    if (getIsOffline()) {
        return Promise.resolve({wasSuccessful: false});
    }
    if (!pendingReauthentication) {
        pendingReauthentication = reauthenticate().finally(() => {
            pendingReauthentication = undefined;
        });
    }
    return pendingReauthentication;
}

/** Check the image endpoint directly because the image loader does not expose HTTP status consistently. */
async function isImageAuthenticationRequired(url: string, encryptedAuthToken: string): Promise<boolean> {
    if (getIsOffline() || !canSendAuthTokenToURL(url)) {
        return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONST.TIMING.IMAGE_LOAD_STALL_TIMEOUT);
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: encryptedAuthToken},
            signal: controller.signal,
        });
        return response.status === CONST.HTTP_STATUS.UNAUTHORIZED;
    } finally {
        clearTimeout(timeout);
    }
}

export {isImageAuthenticationRequired, reauthenticateAttachmentImages};
