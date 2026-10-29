import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';
import {getEncryptedAuthToken} from '@libs/Network/NetworkStore';
import {getIsOffline} from '@libs/NetworkState';
import type {ReauthenticationResult} from '@libs/Reauthentication';

import CONST from '@src/CONST';

/** Let the API middleware recover rejected image credentials without a separate authentication flow. */
async function reauthenticateAttachmentImages(url: string, encryptedAuthToken: string, signal?: AbortSignal): Promise<ReauthenticationResult> {
    if (getIsOffline() || !canSendAuthTokenToURL(url) || signal?.aborted) {
        return {wasSuccessful: false};
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.HEAD_ATTACHMENT, {imageURL: url}, {}, {signal});
    const currentToken = getEncryptedAuthToken();
    return {wasSuccessful: response?.jsonCode === CONST.JSON_CODE.SUCCESS && !!currentToken && currentToken !== encryptedAuthToken};
}

export default reauthenticateAttachmentImages;
