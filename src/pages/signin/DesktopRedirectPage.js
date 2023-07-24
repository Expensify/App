import React from 'react';
import * as App from '../../libs/actions/App';
import DeeplinkRedirectLoadingIndicator from '../../components/DeeplinkWrapper/DeeplinkRedirectLoadingIndicator';

/**
 * Landing page for when a user enters third party login flow on desktop.
 * Allows user to open the link in browser if they accidentally canceled the auto-prompt.
 * Also allows them to continue to the web app if they want to use it there.
 *
 * @returns {React.Component}
 */
function DesktopRedirectPage() {
    return <DeeplinkRedirectLoadingIndicator openLinkInBrowser={App.beginDeepLinkRedirect} />;
}

DesktopRedirectPage.displayName = 'DesktopRedirectPage';

export default DesktopRedirectPage;
