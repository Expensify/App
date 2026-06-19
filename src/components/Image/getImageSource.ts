import {isExpiredSession} from '@libs/actions/Session';
import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';
import type {ImageProps} from './types';

type GetImageSourceParams = {
    propsSource: ImageProps['source'];
    session: Session | undefined;
    isAuthTokenRequired: boolean;
    isOffline: boolean;
};

type GetImageSourceReturn = {
    source: ImageProps['source'];
    shouldReauthenticate: boolean;
};

export default function getImageSource({propsSource, session, isAuthTokenRequired, isOffline}: GetImageSourceParams): GetImageSourceReturn {
    if (typeof propsSource === 'object' && propsSource !== null && 'uri' in propsSource) {
        if (typeof propsSource.uri === 'number') {
            return {source: propsSource.uri, shouldReauthenticate: false};
        }

        const authToken = session?.encryptedAuthToken ?? null;
        if (isAuthTokenRequired && authToken) {
            if (isOffline || (!!session?.creationDate && !isExpiredSession(session.creationDate))) {
                return {
                    source: {
                        ...propsSource,
                        cacheKey: propsSource.uri,
                        headers: {
                            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                        },
                    },
                    shouldReauthenticate: false,
                };
            }

            return {source: undefined, shouldReauthenticate: !!session};
        }
    }

    return {source: propsSource, shouldReauthenticate: false};
}
