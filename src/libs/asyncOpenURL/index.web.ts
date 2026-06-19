import {Linking} from 'react-native';
import type {Linking as LinkingWeb} from 'react-native-web';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {isExternalLinkSchemeAllowed} from '@libs/Url';
import CONST from '@src/CONST';
import type AsyncOpenURL from './types';

/**
 * Prevents Safari from blocking pop-up window when opened within async call.
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
const asyncOpenURL: AsyncOpenURL = (promise, url, shouldSkipCustomSafariLogic, shouldOpenInSameTab) => {
    if (!url) {
        return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const canOpenURLInSameTab = getPlatform() === CONST.PLATFORM.WEB;

    if (!isSafari || !!shouldSkipCustomSafariLogic || !!shouldOpenInSameTab) {
        promise
            .then((params) => {
                const resolvedURL = typeof url === 'string' ? url : url(params);
                if (!isExternalLinkSchemeAllowed(resolvedURL)) {
                    Log.warn('[asyncOpenURL] blocked URL with disallowed scheme', {url: resolvedURL});
                    return;
                }
                (Linking.openURL as LinkingWeb['openURL'])(resolvedURL, shouldOpenInSameTab && canOpenURLInSameTab ? '_self' : undefined);
            })
            .catch(() => {
                Log.warn('[asyncOpenURL] error occurred while opening URL', {url});
            });
    } else {
        const windowRef = window.open();
        promise
            .then((params) => {
                const resolvedURL = typeof url === 'string' ? url : url(params);
                if (!isExternalLinkSchemeAllowed(resolvedURL)) {
                    Log.warn('[asyncOpenURL] blocked URL with disallowed scheme', {url: resolvedURL});
                    windowRef?.close();
                    return;
                }
                if (!windowRef) {
                    (Linking.openURL as LinkingWeb['openURL'])(resolvedURL, '_self');
                    return;
                }
                windowRef.location = resolvedURL;
            })
            .catch(() => {
                windowRef?.close();
                Log.warn('[asyncOpenURL] error occurred while opening URL', {url});
            });
    }
};

export default asyncOpenURL;
