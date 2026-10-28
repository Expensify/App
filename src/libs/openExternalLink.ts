import asyncOpenURL from './asyncOpenURL';

/**
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url: string, shouldSkipCustomSafariLogic = false, shouldOpenInSameTab = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic, shouldOpenInSameTab);
}

export default openExternalLink;
