import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchActionsSkeleton from '@components/Skeletons/SearchActionsSkeleton';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {SearchResults} from '@src/types/onyx';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchSaveButton from './SearchSaveButton';
import useSearchActionsBar from './useSearchActionsBar';

type SearchActionsBarNarrowProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
    isSearchInputVisible: boolean;
    searchResults: OnyxEntry<SearchResults>;
    onSearchButtonPress: () => void;
    onSort: () => void;
};

// NOTE: This is intentionally unused for now. It will be wired up in https://github.com/Expensify/App/issues/84876
function SearchActionsBarNarrow({queryJSON, isMobileSelectionModeEnabled, isSearchInputVisible, searchResults, onSearchButtonPress, onSort}: SearchActionsBarNarrowProps) {
    const {hasErrors, shouldShowActionsBarLoading, shouldShowSelectedDropdown, styles} = useSearchActionsBar(queryJSON, isMobileSelectionModeEnabled);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

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
                        {!isSearchInputVisible && (
                            <Button
                                testID="search-button-narrow"
                                icon={expensifyIcons.MagnifyingGlass}
                                small
                                onPress={onSearchButtonPress}
                            />
                        )}
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
