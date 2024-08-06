import {Linking} from 'react-native';
import Log from '@libs/Log';
import type AsyncOpenURL from './types';

/**
 * Prevents Safari from blocking pop-up window when opened within async call.
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
const asyncOpenURL: AsyncOpenURL = (promise, url, shouldSkipCustomSafariLogic) => {
    if (!url) {
        return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isSafari || shouldSkipCustomSafariLogic) {
        promise
            .then((params) => {
                Linking.openURL(typeof url === 'string' ? url : url(params));
            })
            .catch(() => {
                Log.warn('[asyncOpenURL] error occured while opening URL', {url});
            });
    } else {
        const windowRef = window.open();
        promise
            .then((params) => {
                if (!windowRef) {
                    return;
                }
                windowRef.location = typeof url === 'string' ? url : url(params);
            })
            .catch(() => {
                windowRef?.close();
                Log.warn('[asyncOpenURL] error occured while opening URL', {url});
            });
    }
};

export default asyncOpenURL;
