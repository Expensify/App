import type {ReactNode} from 'react';

import type SearchAdvancedFiltersPopupProps from './types';

// On native platforms, advanced filters is served from SearchAdvancedFiltersPage
function SearchAdvancedFiltersPopup(props: SearchAdvancedFiltersPopupProps): ReactNode;
function SearchAdvancedFiltersPopup() {
    return null;
}

export default SearchAdvancedFiltersPopup;
