import React from 'react';
import type {SearchFilter} from '@libs/SearchUIUtils';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import DropdownButton from '../FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '../FilterDropdowns/DropdownButton';
import useFilterFeedValue from '../hooks/useFilterFeedValue';
import useFilterFromValue from '../hooks/useFilterFromValue';
import useFilterWorkspaceValue from '../hooks/useFilterWorkspaceValue';
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
