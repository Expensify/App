import {Linking} from 'react-native';
import Log from '@libs/Log';
import {sanitizeUrlForLogging} from '@libs/sanitizeLogParams';
import type AsyncOpenURL from './types';

const asyncOpenURL: AsyncOpenURL = (promise, url) => {
    if (!url) {
        return;
    }

    promise
        .then((params) => {
            Linking.openURL(typeof url === 'string' ? url : url(params));
        })
        .catch(() => {
            const safeUrl = typeof url === 'string' ? sanitizeUrlForLogging(url) : '[function]';
            Log.warn('[asyncOpenURL] error occurred while opening URL', {url: safeUrl});
        });
};

export default asyncOpenURL;
