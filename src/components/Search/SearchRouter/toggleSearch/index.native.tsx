import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function openSearch() {
    return Navigation.navigate(ROUTES.SEARCH_ROUTER);
}

function closeSearch() {
    return Navigation.dismissModal();
}

export {openSearch, closeSearch};
