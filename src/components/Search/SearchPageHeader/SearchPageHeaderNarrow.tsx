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
// NOTE: This is intentionally unused for now. It will be wired up in https://github.com/Expensify/App/issues/84876
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
            cancelSearch={cancelSearch}
        />
    );
}

export default SearchPageHeaderNarrow;
