import type {SearchQueryJSON} from '@components/Search/types';

import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

import React from 'react';

import SearchPageHeaderCommon from './SearchPageHeaderCommon';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
};

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled}: SearchPageHeaderNarrowProps) {
    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    // Spend's groups are reached through More on narrow layouts, so the header names the group the user is inside
    // rather than "Spend", and it holds still while they tab within that group.
    return (
        <SearchPageHeaderCommon
            shouldUseGroupTitle
            queryJSONType={queryJSON.type}
            shouldShowLoadingBar={shouldShowLoadingBar}
        />
    );
}

export default SearchPageHeaderNarrow;
