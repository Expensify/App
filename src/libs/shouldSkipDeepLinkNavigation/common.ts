import ROUTES from '@src/ROUTES';

/**
 * The test tools modal is app state surfaced in the URL, not a destination. Replaying it after sign-in
 * reopens the modal on top of whatever the user actually landed on. Matches the nested server page too,
 * since its path starts with the modal's.
 */
function isTestToolsRoute(route: string) {
    return route.includes(ROUTES.TEST_TOOLS_MODAL.route);
}

// eslint-disable-next-line import/prefer-default-export
export {isTestToolsRoute};
