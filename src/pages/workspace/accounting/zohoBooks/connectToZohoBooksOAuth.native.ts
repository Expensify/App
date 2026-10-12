import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/** On native the Zoho Books OAuth setup loads inside an in-app WebView screen. */
// `environmentURL` is unused on native but kept so this matches the web variant's signature, which needs it to open the setup link.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function connectToZohoBooksOAuth(policyID: string, environmentURL: string) {
    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_OAUTH.getRoute(policyID));
}

export default connectToZohoBooksOAuth;
