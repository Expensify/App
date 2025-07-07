"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * After a user authenticates their bank in the Plaid OAuth flow, Plaid returns us to the redirectURI we
 * gave them along with a stateID param. We hand off the receivedRedirectUri to PlaidLink to finish connecting
 * the user's account.
 */
var getPlaidOAuthReceivedRedirectURI = function () {
    var receivedRedirectURI = window.location.href;
    var receivedRedirectSearchParams = new URL(window.location.href).searchParams;
    var oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');
    // If no stateID passed in then we are either not in OAuth flow or flow is broken
    if (!oauthStateID) {
        return undefined;
    }
    return receivedRedirectURI;
};
exports.default = getPlaidOAuthReceivedRedirectURI;
