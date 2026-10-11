import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

import React from 'react';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
};

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled}: SearchPageHeaderNarrowProps) {
    const {translate} = useLocalize();

    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    // The narrow header is the top-level page title, so it stays a static "Spend". The tab selector rendered directly
    // below it already names the current view, and repeating that name here would show the same label twice.
    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={translate('common.spend')}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderNarrow;
