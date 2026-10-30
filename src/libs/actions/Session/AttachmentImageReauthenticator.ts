import {makeHeadRequest} from '@libs/API';
import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';
import {getEncryptedAuthToken} from '@libs/Network/NetworkStore';
import {getIsOffline} from '@libs/NetworkState';
import type {ReauthenticationResult} from '@libs/Reauthentication';

import CONST from '@src/CONST';

/** Check rejected image credentials through the HEAD path and its shared authentication. */
async function reauthenticateAttachmentImages(url: string, encryptedAuthToken: string, signal?: AbortSignal): Promise<ReauthenticationResult> {
    if (getIsOffline() || !canSendAuthTokenToURL(url) || signal?.aborted) {
        return {wasSuccessful: false};
    }

    const status = await makeHeadRequest(url, {signal});
    const currentToken = getEncryptedAuthToken();
    return {wasSuccessful: status === CONST.HTTP_STATUS.OK && !!currentToken && currentToken !== encryptedAuthToken};
}

export default reauthenticateAttachmentImages;
