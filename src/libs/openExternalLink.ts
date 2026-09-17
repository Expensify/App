import asyncOpenURL from './asyncOpenURL';

function openExternalLink(url: string, shouldSkipCustomSafariLogic = false, shouldOpenInSameTab = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic, shouldOpenInSameTab);
}

export default openExternalLink;
