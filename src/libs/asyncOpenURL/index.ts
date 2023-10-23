import {Linking} from 'react-native';
import AsyncOpenURL from './types';

const asyncOpenURL: AsyncOpenURL = (promise, url) => {
    if (!url) {
        return;
    }

    promise.then((params) => {
        Linking.openURL(typeof url === 'string' ? url : url(params));
    });
};

export default asyncOpenURL;
