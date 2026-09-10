import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {CloseSearch, OpenSearch} from './types';

const openSearch: OpenSearch = () => {
    return Navigation.navigate(ROUTES.SEARCH_ROUTER);
};

const closeSearch: CloseSearch = (setSearchState, afterTransition) => {
    return Navigation.dismissModal({afterTransition});
};

export {openSearch, closeSearch};
