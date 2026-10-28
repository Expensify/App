import canSendAuthTokenToURL from '@libs/canSendAuthTokenToURL';

import CONST from '@src/CONST';

import type {ImageProps} from './types';

type GetImageSourceParams = {
    propsSource: ImageProps['source'];
    encryptedAuthToken: string | undefined;
    isAuthTokenRequired: boolean;
};

export default function getImageSource({propsSource, encryptedAuthToken, isAuthTokenRequired}: GetImageSourceParams): ImageProps['source'] {
    if (typeof propsSource !== 'object' || propsSource === null || !('uri' in propsSource)) {
        return propsSource;
    }
    if (typeof propsSource.uri === 'number') {
        return propsSource.uri;
    }
    if (!isAuthTokenRequired || !encryptedAuthToken || !canSendAuthTokenToURL(propsSource.uri ?? '')) {
        return propsSource;
    }
    return {
        ...propsSource,
        cacheKey: propsSource.uri,
        headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: encryptedAuthToken},
    };
}
