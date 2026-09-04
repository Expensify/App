import type {SearchQueryJSON} from '@components/Search/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import SearchActionsBarCreateButton from './SearchActionsBarCreateButton';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchFiltersBarWide from './SearchFiltersBarWide';
import SearchPageInput from './SearchPageInput';
import SearchSaveButton from './SearchSaveButton';

type SearchActionsBarWideProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

function SearchActionsBarWide({queryJSON, searchResults, onSort}: SearchActionsBarWideProps) {
    const styles = useThemeStyles();

    // Selecting rows no longer swaps this bar out for the bulk actions: those moved to the floating BulkActionBar over
    // the list, so the search input and filters stay available while a selection is being built up.
    return (
        <View style={[styles.searchActionsBarContainer]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.pRelative, styles.w100, styles.flexWrap, styles.flexShrink1, styles.gap2, styles.zIndex10]}>
                <SearchPageInput queryJSON={queryJSON} />
                <SearchFiltersBarWide queryJSON={queryJSON} />
            </View>
            <View style={styles.filtersBar}>
                <SearchAdvancedFiltersButton queryJSON={queryJSON} />
                <SearchDisplayDropdownButton
                    queryJSON={queryJSON}
                    searchResults={searchResults}
                    onSort={onSort}
                />
                <SearchSaveButton />
                <SearchActionsBarCreateButton />
            </View>
        </View>
    );
}

SearchActionsBarWide.displayName = 'SearchActionsBarWide';

export default SearchActionsBarWide;
