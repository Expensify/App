"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DeeplinkRedirectLoadingIndicator_1 = require("@components/DeeplinkWrapper/DeeplinkRedirectLoadingIndicator");
var App = require("@userActions/App");
/**
 * Landing page for when a user enters third party login flow on desktop.
 * Allows user to open the link in browser if they accidentally canceled the auto-prompt.
 * Also allows them to continue to the web app if they want to use it there.
 */
function DesktopRedirectPage() {
    return <DeeplinkRedirectLoadingIndicator_1.default openLinkInBrowser={App.beginDeepLinkRedirect}/>;
}
DesktopRedirectPage.displayName = 'DesktopRedirectPage';
exports.default = DesktopRedirectPage;
