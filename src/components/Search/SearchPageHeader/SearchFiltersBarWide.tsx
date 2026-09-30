import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import SearchFilterBar from './SearchFilterBar';
import SearchFiltersResetButton from './SearchFiltersResetButton';
import SearchFiltersSaveButton from './SearchFiltersSaveButton';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchFiltersBarWide({queryJSON}: SearchFiltersBarWideProps) {
    const styles = useThemeStyles();
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
            {hasFiltersOrKeywordChanged && (
                <View style={[styles.flexRow]}>
                    {hasFiltersChanged && <SearchFiltersResetButton onPress={resetFilters} />}
                    <SearchFiltersSaveButton />
                </View>
            )}
        </>
    );
}

SearchFiltersBarWide.displayName = 'SearchFiltersBarWide';

export default SearchFiltersBarWide;
