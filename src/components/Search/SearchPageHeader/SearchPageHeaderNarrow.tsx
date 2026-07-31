import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import useLocalize from '@hooks/useLocalize';

import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

import React from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
};

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled}: SearchPageHeaderNarrowProps) {
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const savedSearch = queryJSON.hash !== undefined ? savedSearches?.[queryJSON.hash] : undefined;
    const headerTitle = queryJSON.hash !== undefined && savedSearch && savedSearch.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? savedSearch.name : translate('common.spend');

    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={headerTitle}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderNarrow;
