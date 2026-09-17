import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';

import React from 'react';

import SearchAdvancedFiltersBase from './SearchAdvancedFiltersBase';

function SearchAdvancedFiltersPage() {
    // This page is only available on the small screen. Other screen sizes will render a modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    if (!isSmallScreenWidth) {
        return Navigation.dismissModal();
    }

    return <SearchAdvancedFiltersBase />;
}

export default SearchAdvancedFiltersPage;
