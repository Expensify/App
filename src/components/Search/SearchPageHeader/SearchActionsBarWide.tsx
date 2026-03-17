import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchActionsSkeleton from '@components/Skeletons/SearchActionsSkeleton';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import useFilterFeedValues from '../hooks/useFilterFeedValue';
import useFilterFromValues from '../hooks/useFilterFromValue';
import useFilterWorkspaceValues from '../hooks/useFilterWorkspaceValue';
import SearchActionsBarCreateButton from './SearchActionsBarCreateButton';
import SearchAdvanceFiltersButton from './SearchAdvanceFiltersButton';
import SearchDisplayDropdownButton from './SearchDisplayDropdownButton';
import SearchPageInputWide from './SearchPageInputWide';
import SearchSaveButton from './SearchSaveButton';
import useSearchActionsBar from './useSearchActionsBar';

type SearchActionsBarWideProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    handleSearch: (value: string) => void;
    onSort: () => void;
};

type SearchDropdownProps = Omit<DropdownButtonProps, 'viewportOffsetTop'>;

function FromDropdown({label, value, PopoverComponent, sentryLabel}: SearchDropdownProps) {
    const fromValue = useFilterFromValues(value);
    return (
        <DropdownButton
            label={label}
            value={fromValue ?? []}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
        />
    );
}

function WorkspaceDropdown({label, value, PopoverComponent, sentryLabel}: SearchDropdownProps) {
    const workspaceValue = useFilterWorkspaceValues(value);
    return (
        <DropdownButton
            label={label}
            value={workspaceValue ?? []}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
        />
    );
}

function FeedDropdown({label, value, PopoverComponent, sentryLabel}: SearchDropdownProps) {
    const feedValue = useFilterFeedValues(value);
    return (
        <DropdownButton
            label={label}
            value={feedValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
        />
    );
}

function SearchActionsBarWide({queryJSON, searchResults, handleSearch, onSort}: SearchActionsBarWideProps) {
    const {filters, hasErrors, shouldShowActionsBarLoading, shouldShowSelectedDropdown, styles} = useSearchActionsBar(queryJSON, false);

    if (hasErrors) {
        return null;
    }

    if (shouldShowActionsBarLoading) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchActionsBarWide',
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
        <View style={[styles.searchActionsBarContainer, styles.gap2]}>
            {shouldShowSelectedDropdown ? (
                <SearchBulkActionsButton queryJSON={queryJSON} />
            ) : (
                <>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.pRelative, styles.w100, styles.flexWrap, styles.flexShrink1, styles.gap2, styles.zIndex10]}>
                        <SearchPageInputWide
                            queryJSON={queryJSON}
                            handleSearch={handleSearch}
                        />
                        {filters.map((item) => {
                            let Component: React.ComponentType<SearchDropdownProps> = DropdownButton;

                            if (item.key === FILTER_KEYS.FROM) {
                                Component = FromDropdown;
                            }

                            if (item.key === FILTER_KEYS.POLICY_ID) {
                                Component = WorkspaceDropdown;
                            }

                            if (item.key === FILTER_KEYS.FEED) {
                                Component = FeedDropdown;
                            }

                            return (
                                <Component
                                    key={item.key}
                                    label={item.label}
                                    value={item.value}
                                    PopoverComponent={item.PopoverComponent}
                                    sentryLabel={item.sentryLabel}
                                />
                            );
                        })}
                    </View>
                    <View style={styles.filtersBar}>
                        <SearchAdvanceFiltersButton queryJSON={queryJSON} />
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
