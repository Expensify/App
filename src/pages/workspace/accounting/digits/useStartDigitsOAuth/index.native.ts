import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/** On native the Digits sign-in loads inside an in-app WebView screen. */
function useStartDigitsOAuth() {
    return (policyID: string) => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_OAUTH.getRoute(policyID));
}

export default useStartDigitsOAuth;
