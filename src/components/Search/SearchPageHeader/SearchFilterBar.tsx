import React from 'react';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterFromValue from '@components/Search/hooks/useFilterFromValue';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';
import type {SearchFilter} from '@libs/SearchUIUtils';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {FilterItem} from './useSearchFiltersBar';

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

function SearchFilterBar({item}: {item: SearchFilter & FilterItem}) {
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
}

export default SearchFilterBar;
