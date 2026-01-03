import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

/**
 * On native devices SearchRouter is served from SearchRouterPage, on web from SearchRouterModal.
 */
function SearchRouterPage() {
    return Navigation.navigate(ROUTES.HOME);
}

SearchRouterPage.displayName = 'SearchRouterPage';

export default SearchRouterPage;
