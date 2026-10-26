import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

/** On native the Digits sign-in loads inside an in-app WebView screen, so the environment URL isn't needed. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Keeps the same signature as the web implementation.
function openDigitsSignIn(policyID: string, environmentURL: string) {
    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_OAUTH.getRoute(policyID));
}

export default openDigitsSignIn;
