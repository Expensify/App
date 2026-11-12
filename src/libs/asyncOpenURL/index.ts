import Log from '@libs/Log';

import {Linking} from 'react-native';

import type AsyncOpenURL from './types';

import getURLForLogging from './getURLForLogging';

const asyncOpenURL: AsyncOpenURL = (promise, url) => {
    if (!url) {
        return;
    }

    promise
        .then((params) => {
            Linking.openURL(typeof url === 'string' ? url : url(params));
        })
        .catch(() => {
            Log.warn('[asyncOpenURL] error occurred while opening URL', {url: getURLForLogging(url)});
        });
};

export default asyncOpenURL;
