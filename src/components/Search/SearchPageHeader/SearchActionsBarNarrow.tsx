import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchActionsSkeleton from '@components/Skeletons/SearchActionsSkeleton';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {SearchResults} from '@src/types/onyx';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchSaveButton from './SearchSaveButton';
import useSearchActionsBar from './useSearchActionsBar';

type SearchActionsBarNarrowProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

function SearchActionsBarNarrow({queryJSON, isMobileSelectionModeEnabled, searchResults, onSort}: SearchActionsBarNarrowProps) {
    const {hasErrors, shouldShowActionsBarLoading, shouldShowSelectedDropdown, styles} = useSearchActionsBar(queryJSON, isMobileSelectionModeEnabled);

    if (hasErrors) {
        return null;
    }

    if (shouldShowActionsBarLoading) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchActionsBarNarrow',
            shouldShowActionsBarLoading,
        };
        return (
            <SearchActionsSkeleton
                shouldAnimate
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    return (
        <View style={[styles.searchActionsBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <SearchBulkActionsButton queryJSON={queryJSON} />
            ) : (
                <>
                    <View style={[styles.flexRow, styles.gap2]}>
                        <SearchAdvancedFiltersButton queryJSON={queryJSON} />
                    </View>
                    <View style={[styles.flexRow, styles.gap2]}>
                        <SearchSaveButton />
                        <SearchDisplayDropdownButton
                            queryJSON={queryJSON}
                            searchResults={searchResults}
                            onSort={onSort}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

SearchActionsBarNarrow.displayName = 'SearchActionsBarNarrow';

export default SearchActionsBarNarrow;
