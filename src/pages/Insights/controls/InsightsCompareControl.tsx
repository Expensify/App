import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {SearchCompareMode} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

/** Stands in for no comparison, which the API has no mode of its own for. */
const COMPARE_NONE = 'none';

type InsightsCompareControlProps = InsightsControlProps<SearchCompareMode | undefined> & {
    /** Compare mode the dashboard starts from, which Reset returns to */
    defaultValue: SearchCompareMode | undefined;
};

function InsightsCompareControl({value, defaultValue, onChange}: InsightsCompareControlProps) {
    const {translate} = useLocalize();
    const label = translate('insightsPage.compare.label');

    const items: Array<SingleSelectItem<SearchCompareMode | typeof COMPARE_NONE>> = [
        {text: translate('common.none'), value: COMPARE_NONE},
        {text: translate('insightsPage.compare.previousPeriod'), value: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD},
        {text: translate('insightsPage.compare.average'), value: CONST.SEARCH.COMPARE.AVERAGE},
    ];
    const selectedItem = items.find((item) => item.value === (value ?? COMPARE_NONE));

    const comparePopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={label}
            items={items}
            value={selectedItem}
            defaultValue={defaultValue ?? COMPARE_NONE}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(!item || item.value === COMPARE_NONE ? undefined : item.value)}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.COMPARE}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.COMPARE}
        />
    );

    return (
        <DropdownButton
            label={label}
            // The pill reads as just "Compare" while nothing is compared, like the other filters with no selection
            value={value ? (selectedItem?.text ?? null) : null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_COMPARE}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={comparePopover}
        />
    );
}

export default InsightsCompareControl;
