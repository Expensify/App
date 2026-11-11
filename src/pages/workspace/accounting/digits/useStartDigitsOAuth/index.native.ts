import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/**
 * On native the Digits sign-in loads inside an in-app WebView screen. That screen goes back to the Connections page by
 * itself, so unlike on web there is no modal to dismiss, and dismissing one would close the WebView with it.
 */
function useStartDigitsOAuth() {
    return (policyID: string) => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_OAUTH.getRoute(policyID));
}

export default useStartDigitsOAuth;
