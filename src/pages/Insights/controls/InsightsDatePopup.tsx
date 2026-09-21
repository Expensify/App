import type {CustomDateModifier} from '@components/Search/FilterComponents/DatePresetFilterBase';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';

import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React from 'react';

const INSIGHTS_ALLOWED_CUSTOM_DATE_MODIFIERS: readonly CustomDateModifier[] = [CONST.SEARCH.DATE_MODIFIERS.ON];

const INSIGHTS_DATE_PRESETS = getDatePresets(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, false);

type InsightsDatePopupProps = {
    label: string;
    value: SearchDateValues;
    onChange: (value: SearchDateValues) => void;
    closeOverlay: () => void;
    setPopoverWidth?: (width: number | undefined) => void;
};

function InsightsDatePopup({label, value, onChange, closeOverlay, setPopoverWidth}: InsightsDatePopupProps) {
    return (
        <DateSelectPopup
            label={label}
            value={value}
            presets={INSIGHTS_DATE_PRESETS}
            allowedCustomDateModifiers={INSIGHTS_ALLOWED_CUSTOM_DATE_MODIFIERS}
            onChange={onChange}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
        />
    );
}

export default InsightsDatePopup;
