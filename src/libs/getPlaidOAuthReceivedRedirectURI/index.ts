import type GetPlaidOAuthReceivedRedirectURI from './types';

/**
 * After a user authenticates their bank in the Plaid OAuth flow, Plaid returns us to the redirectURI we
 * gave them along with a stateID param. We hand off the receivedRedirectUri to PlaidLink to finish connecting
 * the user's account.
 */
const getPlaidOAuthReceivedRedirectURI: GetPlaidOAuthReceivedRedirectURI = () => {
    const receivedRedirectURI = window.location.href;
    const receivedRedirectSearchParams = new URL(window.location.href).searchParams;
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');

    // If no stateID passed in then we are either not in OAuth flow or flow is broken
    if (!oauthStateID) {
        return undefined;
    }
    return receivedRedirectURI;
};

export default getPlaidOAuthReceivedRedirectURI;
