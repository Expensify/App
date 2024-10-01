import {Linking} from 'react-native';
import Log from '@libs/Log';
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
            Log.warn('[asyncOpenURL] error occured while opening URL', {url});
        });
};

export default asyncOpenURL;
