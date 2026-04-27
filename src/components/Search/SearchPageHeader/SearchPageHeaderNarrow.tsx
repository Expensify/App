import React from 'react';
import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
    cancelSearch?: () => void;
};

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled, cancelSearch}: SearchPageHeaderNarrowProps) {
    const {translate} = useLocalize();

    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    return (
        <TopBar
            shouldShowLoadingBar={shouldShowLoadingBar}
            breadcrumbLabel={translate('common.spend')}
            shouldDisplaySearch={false}
            shouldDisplayHelpButton
            cancelSearch={cancelSearch}
        />
    );
}

export default SearchPageHeaderNarrow;
