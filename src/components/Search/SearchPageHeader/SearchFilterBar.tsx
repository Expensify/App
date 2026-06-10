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
import CONST from '@src/CONST';
import type {FilterItem} from './useSearchFiltersBar';

type DropdownProps = Pick<DropdownButtonProps, 'label' | 'PopoverComponent' | 'sentryLabel' | 'onClosePress'> & {
    value: SearchFilter['value'];
};

function UserDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
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

function WorkspaceDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
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

function FeedDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
    const feedValue = useFilterFeedValue(value as string[]);
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

function CardDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
    const cardValue = useFilterCardValue(value as string[]);
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

function TaxRateDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
    const taxRateValue = useFilterTaxRateValue(value as string[]);
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

function ReportDropdown({label, value, PopoverComponent, sentryLabel, onClosePress}: DropdownProps) {
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

const FILTER_COMPONENT_MAP: Partial<Record<SearchFilter['key'], React.ComponentType<DropdownProps>>> = {
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM]: UserDropdown,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TO]: UserDropdown,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE]: UserDropdown,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE]: UserDropdown,

    [CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID]: WorkspaceDropdown,

    [CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED]: FeedDropdown,
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID]: CardDropdown,

    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE]: TaxRateDropdown,

    [CONST.SEARCH.SYNTAX_FILTER_KEYS.IN]: ReportDropdown,
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
