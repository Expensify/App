import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';

import React from 'react';

import SearchFilterBar from './SearchFilterBar';
import SearchFiltersActionButtons from './SearchFiltersActionButtons';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarWide({queryJSON}: SearchFiltersBarWideProps) {
    const {filters, hasErrors, shouldShowFiltersBarLoading, hasFiltersChanged, hasFiltersOrKeywordChanged, resetFilters} = useSearchFiltersBar(queryJSON);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    return (
        <>
            {filters.map((item) => (
                <SearchFilterBar
                    key={item.key}
                    item={item}
                />
            ))}
            <SearchFiltersActionButtons
                hasFiltersChanged={hasFiltersChanged}
                hasFiltersOrKeywordChanged={hasFiltersOrKeywordChanged}
                resetFilters={resetFilters}
            />
        </>
    );
}

SearchFiltersBarWide.displayName = 'SearchFiltersBarWide';

export default SearchFiltersBarWide;
