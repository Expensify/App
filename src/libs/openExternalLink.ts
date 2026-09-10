import asyncOpenURL from './asyncOpenURL';

/**
 * Opens a URL outside the app.
 *
 * Lives in its own module rather than in `actions/Link` so that callers needing only this can avoid importing
 * the whole link action module, which reaches into the report and session layers and closes import cycles.
 *
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url: string, shouldSkipCustomSafariLogic = false, shouldOpenInSameTab = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic, shouldOpenInSameTab);
}

export default openExternalLink;
