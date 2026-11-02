import type {CustomDateModifier} from '@components/Search/FilterComponents/DatePresetFilterBase';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';

import {getDateDisplayValue, getDatePresets} from '@libs/SearchUIUtils';

import {fromSearchDateValues, toSearchDateValues} from '@pages/Insights/insightsFilterParsing';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildDateFormValues} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

import React from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

const INSIGHTS_ALLOWED_CUSTOM_DATE_MODIFIERS: readonly CustomDateModifier[] = [CONST.SEARCH.DATE_MODIFIERS.ON];
const INSIGHTS_DATE_PRESETS = getDatePresets(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, false);

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

export default InsightsDateControl;
