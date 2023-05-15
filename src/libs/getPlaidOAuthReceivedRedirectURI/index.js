/**
 * After a user authenticates their bank in the Plaid OAuth flow, Plaid returns us to the redirectURI we
 * gave them along with a stateID param. We hand off the receivedRedirectUri to PlaidLink to finish connecting
 * the user's account.
 * @returns {String | null}
 */
export default () => {
    const receivedRedirectURI = window.location.href;
    const receivedRedirectSearchParams = new URL(window.location.href).searchParams;
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');

    // If no stateID passed in then we are either not in OAuth flow or flow is broken
    if (!oauthStateID) {
        return null;
    }
    return receivedRedirectURI;
};
