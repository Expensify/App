import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterFromValue from '@components/Search/hooks/useFilterFromValue';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchActionsSkeleton from '@components/Skeletons/SearchActionsSkeleton';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import SearchActionsBarCreateButton from './SearchActionsBarCreateButton';
import SearchAdvancedFiltersButton from './SearchAdvancedFiltersButton';
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
    const fromValue = useFilterFromValue(value);
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
    const workspaceValue = useFilterWorkspaceValue(value);
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
    const feedValue = useFilterFeedValue(value);
    return (
        <DropdownButton
            label={label}
            value={feedValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
        />
    );
}

const FILTER_KEY_TO_COMPONENT: Partial<Record<SearchAdvancedFiltersKey, React.ComponentType<SearchDropdownProps>>> = {
    [FILTER_KEYS.FROM]: FromDropdown,
    [FILTER_KEYS.POLICY_ID]: WorkspaceDropdown,
    [FILTER_KEYS.FEED]: FeedDropdown,
};

// NOTE: This is intentionally unused for now. It will be wired up in https://github.com/Expensify/App/issues/84876
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
                            const Component = FILTER_KEY_TO_COMPONENT[item.key] ?? DropdownButton;
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
