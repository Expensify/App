import React from 'react';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import useFilterCardValue from '@components/Search/hooks/useFilterCardValue';
import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterReportValue from '@components/Search/hooks/useFilterReportValue';
import useFilterTaxRateValue from '@components/Search/hooks/useFilterTaxRateValue';
import useFilterUserValue from '@components/Search/hooks/useFilterUserValue';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';
import type {SearchFilter} from '@libs/SearchUIUtils';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {FilterItem} from './useSearchFiltersBar';

type SearchDropdownProps = Omit<DropdownButtonProps, 'viewportOffsetTop'>;

function UserDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const users = useFilterUserValue(value);
    return (
        <DropdownButton
            label={label}
            value={users ?? []}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

function WorkspaceDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const workspaceValue = useFilterWorkspaceValue(value);
    return (
        <DropdownButton
            label={label}
            value={workspaceValue ?? []}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

function FeedDropdown({label, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const feedValue = useFilterFeedValue();
    return (
        <DropdownButton
            label={label}
            value={feedValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

function CardDropdown({label, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const cardValue = useFilterCardValue();
    return (
        <DropdownButton
            label={label}
            value={cardValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

function TaxRateDropdown({label, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const taxRateValue = useFilterTaxRateValue();
    return (
        <DropdownButton
            label={label}
            value={taxRateValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

function ReportDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: SearchDropdownProps) {
    const reportValue = useFilterReportValue(value);
    return (
        <DropdownButton
            label={label}
            value={reportValue}
            PopoverComponent={PopoverComponent}
            sentryLabel={sentryLabel}
            onClosePress={onClosePress}
        />
    );
}

const FILTER_COMPONENT_MAP: Partial<Record<SearchAdvancedFiltersKey, React.ComponentType<SearchDropdownProps>>> = {
    [FILTER_KEYS.FROM]: UserDropdown,
    [FILTER_KEYS.TO]: UserDropdown,
    [FILTER_KEYS.ATTENDEE]: UserDropdown,
    [FILTER_KEYS.ASSIGNEE]: UserDropdown,

    [FILTER_KEYS.POLICY_ID]: WorkspaceDropdown,

    [FILTER_KEYS.FEED]: FeedDropdown,
    [FILTER_KEYS.CARD_ID]: CardDropdown,

    [FILTER_KEYS.TAX_RATE]: TaxRateDropdown,

    [FILTER_KEYS.IN]: ReportDropdown,
};

function SearchFilterBar({item}: {item: SearchFilter & FilterItem}) {
    const Component = FILTER_COMPONENT_MAP[item.key] ?? DropdownButton;
    return (
        <Component
            key={item.key}
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
            sentryLabel={item.sentryLabel}
            onClosePress={item.onClosePress}
        />
    );
}

export default SearchFilterBar;
