import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';

import CONST from '@src/CONST';

export default function fetchImage(source: string, authToken: string) {
    return fetch(source, {
        headers: canSendAuthTokenToURL(source) ? {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken} : undefined,
    })
        .then((res) => res.blob())
        .then((blob) => {
            return URL.createObjectURL(blob);
        });
}
