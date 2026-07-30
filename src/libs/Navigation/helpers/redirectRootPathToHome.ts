import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const HOME_PATH = `/${ROUTES.HOME}`;

/**
 * Resolves the root path (and the legacy aliases that point at it) to the Home page.
 *
 * No screen owns the empty pattern in the linking config, so this redirect is the only owner of the root:
 * an empty pattern can't be serialized back into a URL (`getPathFromState` turns it into `/undefined`),
 * which is why Home stays registered under its own `home` pattern and `/home` is the canonical Home URL.
 *
 * Must be applied by every path-to-state entry point (`getStateFromPath` and `getAdaptedStateFromPath`),
 * otherwise in-app navigation and guard redirects resolve the root differently - and since nothing else
 * matches `/`, react-navigation would fail to parse it at all.
 */
function redirectRootPathToHome(path: string): string {
    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    // `/Home` (capital H) has no route mapping either — the config maps SCREENS.HOME to lowercase 'home' — so it would fall through to NOT_FOUND.
    if (path === '/' || path === CONST.SIGNIN_ROUTE || path === `/${SCREENS.HOME}`) {
        return HOME_PATH;
    }

    return path;
}

export default redirectRootPathToHome;
