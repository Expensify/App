import ROUTES, {VERIFY_ACCOUNT} from '@src/ROUTES';

export default function shouldSkipDeepLinkNavigation(route: string) {
    // When deep-linking to desktop app with `transition` route we don't want to call navigate
    // on the route because it will display an infinite loading indicator.
    // See issue: https://github.com/Expensify/App/issues/33149
    //
    // In general, we don't want to repeat the navigation, when the component might redirect to a different page when first mounted,
    // like with the verify account page components. See PR: https://github.com/Expensify/App/pull/68401
    if (route.includes(ROUTES.TRANSITION_BETWEEN_APPS) || route.includes(VERIFY_ACCOUNT)) {
        return true;
    }

    return false;
}
