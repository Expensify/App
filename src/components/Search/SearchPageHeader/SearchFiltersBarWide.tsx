import React from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchActionsSkeleton from '@components/Skeletons/SearchActionsSkeleton';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import SearchFilterBar from './SearchFilterBar';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarWide({queryJSON}: SearchFiltersBarWideProps) {
    const {filters, hasErrors, shouldShowFiltersBarLoading} = useSearchFiltersBar(queryJSON);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchActionsBarWide',
            shouldShowFiltersBarLoading,
        };
        return (
            <SearchActionsSkeleton
                shouldAnimate
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    return filters.map((item) => (
        <SearchFilterBar
            key={item.key}
            item={item}
        />
    ));
}

SearchFiltersBarWide.displayName = 'SearchFiltersBarWide';

export default SearchFiltersBarWide;
