import CurrencyPopup from '@components/Search/FilterDropdowns/CurrencyPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateDisplayValue} from '@libs/SearchUIUtils';

import {fromSearchDateValues, toSearchDateValues} from '@pages/Insights/insightsFilterParsing';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildDateFormValues} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import InsightsControlDropdown from './InsightsControlDropdown';
import InsightsDatePopup from './InsightsDatePopup';
import InsightsGroupByDropdown from './InsightsGroupByDropdown';
import InsightsWorkspacePopup from './InsightsWorkspacePopup';

type InsightsControlProps<T> = {
    value: T;
    onChange: (value: T) => void;
};

/** Reads the workspace names in its own component, so the hook behind the pill's value isn't called conditionally. */
function InsightsWorkspaceControl({value, onChange}: InsightsControlProps<string[]>) {
    const {translate} = useLocalize();
    const workspaceNames = useFilterWorkspaceValue(value);
    const label = translate('workspace.common.workspace');

    const workspacePopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsWorkspacePopup
            label={label}
            value={value}
            onChange={onChange}
            closeOverlay={closeOverlay}
        />
    );

    return (
        <InsightsControlDropdown
            label={label}
            value={workspaceNames || null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_WORKSPACE}
            PopoverComponent={workspacePopover}
        />
    );
}

function InsightsDateControl({value, onChange}: InsightsControlProps<InsightsFilters['date']>) {
    const {translate, dateFnsLocale} = useLocalize();
    const label = translate('common.date');

    const datePopover = ({closeOverlay, setPopoverWidth}: PopoverComponentProps) => (
        <InsightsDatePopup
            label={label}
            value={toSearchDateValues(value)}
            // A picker left with nothing Insights can report on keeps the date the dashboard already had.
            onChange={(dateValues) => onChange(fromSearchDateValues(dateValues) ?? value)}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
        />
    );

    return (
        <InsightsControlDropdown
            label={label}
            value={getDateDisplayValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, buildDateFormValues(value), translate, dateFnsLocale)}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_DATE}
            PopoverComponent={datePopover}
        />
    );
}

function InsightsGroupCurrencyControl({value, onChange}: InsightsControlProps<string>) {
    const {translate} = useLocalize();
    const label = translate('common.groupCurrency');

    const currencyPopover = ({closeOverlay}: PopoverComponentProps) => (
        <CurrencyPopup
            label={label}
            value={value}
            defaultValue={value}
            searchPlaceholder={translate('common.search')}
            onChange={(item) => onChange(item?.value ?? value)}
            closeOverlay={closeOverlay}
        />
    );

    return (
        <InsightsControlDropdown
            label={label}
            value={value}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_CURRENCY}
            PopoverComponent={currencyPopover}
        />
    );
}

type InsightsPageControlsProps = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    onChange: (update: Partial<InsightsFilters>) => void;

    /* Whether the group-by control sits in this row. */
    shouldShowGroupBy?: boolean;
};

/** The Insights page's controls: what every chart on the dashboard is narrowed by. */
function InsightsPageControls({filters, onChange, shouldShowGroupBy = false}: InsightsPageControlsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2, styles.ph5, styles.pb3]}>
            {!!shouldShowGroupBy && (
                <InsightsGroupByDropdown
                    groupBy={filters.groupBy}
                    onChange={(groupBy) => onChange({groupBy})}
                />
            )}
            <InsightsDateControl
                value={filters.date}
                onChange={(date) => onChange({date})}
            />
            <InsightsWorkspaceControl
                value={filters.policyIDs}
                onChange={(policyIDs) => onChange({policyIDs})}
            />
            <InsightsGroupCurrencyControl
                value={filters.groupCurrency}
                onChange={(groupCurrency) => onChange({groupCurrency})}
            />
        </View>
    );
}

export default InsightsPageControls;
