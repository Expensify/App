import {Linking} from 'react-native';
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
    } else {
        const windowRef = window.open();
        promise
            .then((params) => {
                if (!windowRef) {
                    return;
                }
                if (typeof url === 'string') {
                    windowRef.location = url;
                    return;
                }
                if (!params) {
                    return;
                }
                windowRef.location = url(params);
            })
            .catch(() => windowRef?.close());
    }
};

export default asyncOpenURL;
