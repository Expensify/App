import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchResults} from '@src/types/onyx';
import SearchActionsBarCreateButton from './SearchActionsBarCreateButton';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchFiltersBarWide from './SearchFiltersBarWide';
import SearchPageInputWide from './SearchPageInputWide';
import SearchSaveButton from './SearchSaveButton';

type SearchActionsBarWideProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    handleSearch: (value: string) => void;
    onSort: () => void;
};

function SearchActionsBarWide({queryJSON, searchResults, handleSearch, onSort}: SearchActionsBarWideProps) {
    const styles = useThemeStyles();
    const {selectedTransactions} = useSearchStateContext();
    const hasSelectedItems = Object.keys(selectedTransactions ?? {}).length > 0;

    return (
        <View style={[styles.searchActionsBarContainer, styles.gap2, styles.mt3]}>
            {hasSelectedItems ? (
                <View style={styles.searchBulkActionsButton}>
                    <SearchBulkActionsButton queryJSON={queryJSON} />
                </View>
            ) : (
                <>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.pRelative, styles.w100, styles.flexWrap, styles.flexShrink1, styles.gap2, styles.zIndex10]}>
                        <SearchPageInputWide
                            queryJSON={queryJSON}
                            handleSearch={handleSearch}
                        />
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
                </>
            )}
        </View>
    );
}

SearchActionsBarWide.displayName = 'SearchActionsBarWide';

export default SearchActionsBarWide;
