import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

function openSearch(_setIsSearchRouterDisplayed?: React.Dispatch<React.SetStateAction<boolean>>) {
    return Navigation.navigate(ROUTES.SEARCH_ROUTER);
}

function closeSearch(_setIsSearchRouterDisplayed: React.Dispatch<React.SetStateAction<boolean>>, afterTransition?: () => void) {
    return Navigation.dismissModal({afterTransition});
}

export {openSearch, closeSearch};
