import {isExpiredSession} from '@libs/actions/Session';

import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';

import type {ImageProps} from './types';

type GetImageSourceParams = {
    propsSource: ImageProps['source'];
    session: Session | undefined;
    isAuthTokenRequired: boolean;
    isOffline: boolean;

    /** Whether the auth token can still be refreshed in the background */
    canReauthenticateSilently: boolean;
};

type GetImageSourceReturn = {
    source: ImageProps['source'];
    shouldReauthenticate: boolean;
};

export default function getImageSource({propsSource, session, isAuthTokenRequired, isOffline, canReauthenticateSilently}: GetImageSourceParams): GetImageSourceReturn {
    if (typeof propsSource === 'object' && propsSource !== null && 'uri' in propsSource) {
        if (typeof propsSource.uri === 'number') {
            return {source: propsSource.uri, shouldReauthenticate: false};
        }

        const authToken = session?.encryptedAuthToken ?? null;
        if (isAuthTokenRequired && authToken) {
            // The age check is a client-side guess, not proof the token is dead. Without a way to refresh it,
            // blanking the image only loses a working attachment, so keep serving the token we already have.
            if (isOffline || !canReauthenticateSilently || (!!session?.creationDate && !isExpiredSession(session.creationDate))) {
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
