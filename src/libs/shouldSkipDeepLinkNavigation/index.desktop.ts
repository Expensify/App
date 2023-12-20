import ROUTES from '@src/ROUTES';

export default function shouldSkipDeepLinkNavigation(route: string) {
    // When deep-linking to desktop app with `transition` route we don't want to call navigate
    // on the route because it will display an infinite loading indicator.
    // See issue: https://github.com/Expensify/App/issues/33149
    if (route.includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
        return true;
    }

    return false;
}
