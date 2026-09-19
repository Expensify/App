import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';

import React from 'react';

import SearchFilterBar from './SearchFilterBar';
import SearchFiltersResetButton from './SearchFiltersResetButton';
import SearchFiltersSaveButton from './SearchFiltersSaveButton';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarWide({queryJSON}: SearchFiltersBarWideProps) {
    const {filters, hasErrors, shouldShowFiltersBarLoading, hasFiltersChanged, resetFilters} = useSearchFiltersBar(queryJSON);

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
            {hasFiltersChanged && (
                <>
                    <SearchFiltersResetButton onPress={resetFilters} />
                    <SearchFiltersSaveButton />
                </>
            )}
        </>
    );
}

SearchFiltersBarWide.displayName = 'SearchFiltersBarWide';

export default SearchFiltersBarWide;
