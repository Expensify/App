import type {CustomDateModifier} from '@components/Search/FilterComponents/DatePresetFilterBase';
import CurrencyPopup from '@components/Search/FilterDropdowns/CurrencyPopup';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateDisplayValue, getDatePresets} from '@libs/SearchUIUtils';

import {fromSearchDateValues, toSearchDateValues} from '@pages/Insights/insightsFilterParsing';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildDateFormValues} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import InsightsGroupByDropdown from './InsightsGroupByDropdown';
import InsightsWorkspacePopup from './InsightsWorkspacePopup';

/** The row is right-aligned, so every popover opens inward from the pill's right edge. */
const INSIGHTS_CONTROL_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

/** `On` alone makes the custom page a single-day calendar. */
const INSIGHTS_ALLOWED_CUSTOM_DATE_MODIFIERS: readonly CustomDateModifier[] = [CONST.SEARCH.DATE_MODIFIERS.ON];
const INSIGHTS_DATE_PRESETS = getDatePresets(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, false);

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
        <DropdownButton
            label={label}
            value={workspaceNames || null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_WORKSPACE}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={workspacePopover}
        />
    );
}

function InsightsDateControl({value, onChange}: InsightsControlProps<InsightsFilters['date']>) {
    const {translate, dateFnsLocale} = useLocalize();
    const label = translate('common.date');

    const datePopover = ({closeOverlay, setPopoverWidth}: PopoverComponentProps) => (
        <DateSelectPopup
            label={label}
            value={toSearchDateValues(value)}
            presets={INSIGHTS_DATE_PRESETS}
            allowedCustomDateModifiers={INSIGHTS_ALLOWED_CUSTOM_DATE_MODIFIERS}
            onChange={(dateValues) => onChange(fromSearchDateValues(dateValues) ?? value)}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={getDateDisplayValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, buildDateFormValues(value), translate, dateFnsLocale)}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_DATE}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
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
        <DropdownButton
            label={label}
            value={value}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_CURRENCY}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={currencyPopover}
        />
    );
}

type InsightsPageControlsProps = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    onChange: (update: Partial<InsightsFilters>) => void;
};

/** The Insights page's controls: what every chart on the dashboard is narrowed by. */
function InsightsPageControls({filters, onChange}: InsightsPageControlsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2, styles.ph5, styles.pb3]}>
            <InsightsGroupByDropdown
                groupBy={filters.groupBy}
                onChange={(groupBy) => onChange({groupBy})}
            />
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
