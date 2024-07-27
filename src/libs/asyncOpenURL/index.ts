import {Linking} from 'react-native';
import type AsyncOpenURL from './types';

const asyncOpenURL: AsyncOpenURL = (promise, url) => {
    if (!url) {
        return;
    }

    promise.then((params) => {
        if (typeof url === 'string') {
            Linking.openURL(url);
            return;
        }
        if (!params) {
            return;
        }
        Linking.openURL(url(params));
    });
};

export default asyncOpenURL;
