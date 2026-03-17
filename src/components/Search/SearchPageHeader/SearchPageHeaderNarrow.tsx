import React from 'react';
import TopBar from '@components/Navigation/TopBar';
import useLocalize from '@hooks/useLocalize';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import type {SearchQueryJSON} from '../types';

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
            breadcrumbLabel={translate('common.reports')}
            shouldDisplaySearch={false}
            cancelSearch={cancelSearch}
        />
    );
}

export default SearchPageHeaderNarrow;
