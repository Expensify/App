import {Linking} from 'react-native';
import Log from '@libs/Log';
import {sanitizeUrlForLogging} from '@libs/sanitizeLogParams';
import {isExternalLinkSchemeAllowed} from '@libs/Url';
import type AsyncOpenURL from './types';

const asyncOpenURL: AsyncOpenURL = (promise, url) => {
    if (!url) {
        return;
    }

    promise
        .then((params) => {
            const resolvedURL = typeof url === 'string' ? url : url(params);
            if (!isExternalLinkSchemeAllowed(resolvedURL)) {
                Log.warn('[asyncOpenURL] blocked URL with disallowed scheme', {url: sanitizeUrlForLogging(resolvedURL)});
                return;
            }
            Linking.openURL(resolvedURL);
        })
        .catch(() => {
            const safeUrl = typeof url === 'string' ? sanitizeUrlForLogging(url) : '[function]';
            Log.warn('[asyncOpenURL] error occurred while opening URL', {url: safeUrl});
        });
};

export default asyncOpenURL;
