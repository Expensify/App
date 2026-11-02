import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import SearchAdvancedFiltersContentBase from './SearchAdvancedFiltersContentBase';

function SearchAdvancedFiltersContentPage() {
    // This page is only available on the small screen. Other screen sizes will render a modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    if (!isSmallScreenWidth) {
        return Navigation.dismissModal();
    }

    return <SearchAdvancedFiltersContentBase />;
}

export default SearchAdvancedFiltersContentPage;
