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

    return (
        <SearchPageHeaderCommon
            queryJSONType={queryJSON.type}
            shouldShowLoadingBar={shouldShowLoadingBar}
        />
    );
}

export default SearchPageHeaderNarrow;
