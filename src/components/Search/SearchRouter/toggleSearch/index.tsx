import type {CloseSearch, OpenSearch} from './types';

const openSearch: OpenSearch = (setSearchState) => {
    return setSearchState(true);
};

const closeSearch: CloseSearch = (setSearchState) => {
    return setSearchState(false);
};

export {openSearch, closeSearch};
