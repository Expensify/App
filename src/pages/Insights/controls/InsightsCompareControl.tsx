import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {SearchCompareMode} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

function InsightsCompareControl({value, onChange}: InsightsControlProps<SearchCompareMode | undefined>) {
    const {translate} = useLocalize();
    const label = translate('insightsPage.compare.label');

    const items = [
        {text: translate('insightsPage.compare.previousPeriod'), value: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD},
        {text: translate('insightsPage.compare.average'), value: CONST.SEARCH.COMPARE.AVERAGE},
    ];
    const selectedItem = items.find((item) => item.value === value);

    const comparePopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={label}
            items={items}
            value={selectedItem}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(item?.value)}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={selectedItem?.text ?? null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_COMPARE}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={comparePopover}
        />
    );
}

export default InsightsCompareControl;
