import React from 'react';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

function SearchPage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useConfirmReadyToOpenApp();

    if (shouldUseNarrowLayout) {
        return <SearchPageNarrow />;
    }
    return <SearchPageWide />;
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
