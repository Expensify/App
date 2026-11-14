import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/** On native the Zoho Books OAuth setup loads inside an in-app WebView screen. */
function useStartZohoBooksOAuth() {
    return (policyID: string) => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_OAUTH.getRoute(policyID));
}

export default useStartZohoBooksOAuth;
