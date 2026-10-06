import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';

import React from 'react';

import type {UseSearchFiltersBarResult} from './useSearchFiltersBar';

import SearchFilterBar from './SearchFilterBar';
import SearchFiltersActionButtons from './SearchFiltersActionButtons';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideContentProps = {
    hasErrors: boolean;
    shouldShowFiltersBarLoading: boolean;
    filters: UseSearchFiltersBarResult['filters'];
};

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarWideContent({hasErrors, shouldShowFiltersBarLoading, filters}: SearchFiltersBarWideContentProps) {
    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    return filters.map((item) => (
        <SearchFilterBar
            key={item.key}
            item={item}
        />
    ));
}

function SearchFiltersBarWide({queryJSON}: SearchFiltersBarWideProps) {
    const {filters, hasErrors, shouldShowFiltersBarLoading, hasFiltersChanged, hasFiltersOrKeywordChanged, resetFilters} = useSearchFiltersBar(queryJSON);

    return (
        <>
            <SearchFiltersBarWideContent
                hasErrors={hasErrors}
                shouldShowFiltersBarLoading={shouldShowFiltersBarLoading}
                filters={filters}
            />
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
