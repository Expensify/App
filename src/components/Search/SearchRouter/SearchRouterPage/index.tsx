import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

/**
 * On native devices SearchRouter is served from SearchRouterPage, on web from SearchRouterModal.
 */
function SearchRouterPage() {
    // @TODO: Navigate to HOME when removing the newDotHome beta
    return Navigation.navigate(ROUTES.INBOX);
}

export default SearchRouterPage;
