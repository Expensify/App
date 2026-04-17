// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchActionsBar.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchResults} from '@src/types/onyx';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchSaveButton from './SearchSaveButton';

type SearchActionsBarNarrowProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

function SearchActionsBarNarrow({queryJSON, searchResults, onSort}: SearchActionsBarNarrowProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr5, styles.mb4]}>
            <SearchAdvancedFiltersButton queryJSON={queryJSON} />
            <SearchSaveButton />
            <SearchDisplayDropdownButton
                queryJSON={queryJSON}
                searchResults={searchResults}
                onSort={onSort}
            />
        </View>
    );
}

SearchActionsBarNarrow.displayName = 'SearchActionsBarNarrow';

export default SearchActionsBarNarrow;
export type {SearchActionsBarNarrowProps};
