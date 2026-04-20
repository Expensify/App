import React, {useRef} from 'react';
import {FlatList} from 'react-native';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import type {SearchFilter} from '@libs/SearchUIUtils';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import SearchFilterBar from './SearchFilterBar';
import useSearchFiltersBar from './useSearchFiltersBar';
import type {FilterItem} from './useSearchFiltersBar';

type SearchFiltersBarNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarNarrow({queryJSON}: SearchFiltersBarNarrowProps) {
    const scrollRef = useRef<FlatList<SearchFilter & FilterItem>>(null);
    const {filters, hasErrors, shouldShowFiltersBarLoading, styles} = useSearchFiltersBar(queryJSON);

    const adjustScroll = (info: {distanceFromEnd: number}) => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!shouldAdjustScroll || info.distanceFromEnd > 0) {
            return;
        }
        scrollRef.current?.scrollToEnd();
    };

    const renderFilterItem = ({item}: {item: SearchFilter & FilterItem}) => <SearchFilterBar item={item} />;

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchFiltersBarNarrow',
            shouldShowFiltersBarLoading,
        };
        return (
            <SearchFiltersSkeleton
                shouldAnimate
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    return (
        <FlatList
            horizontal
            keyboardShouldPersistTaps="always"
            style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0, !!filters.length && styles.mb4]}
            contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.key}
            renderItem={renderFilterItem}
            onEndReached={adjustScroll}
            onEndReachedThreshold={0.75}
        />
    );
}

SearchFiltersBarNarrow.displayName = 'SearchFiltersBarNarrow';

export default SearchFiltersBarNarrow;
export type {SearchFiltersBarNarrowProps};
