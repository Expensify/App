import React from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SearchFiltersBarNarrow from './SearchFiltersBarNarrow';
import SearchFiltersBarWide from './SearchFiltersBarWide';

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
};

function SearchFiltersBar({queryJSON, isMobileSelectionModeEnabled}: SearchFiltersBarProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout ? (
        <SearchFiltersBarNarrow
            queryJSON={queryJSON}
            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
        />
    ) : (
        <SearchFiltersBarWide
            queryJSON={queryJSON}
            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
        />
    );
}

export default SearchFiltersBar;
