import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';

import useLocalize from '@hooks/useLocalize';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS, {INSIGHTS_GROUP_BY_OPTIONS} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

import React from 'react';

import InsightsControlDropdown from './InsightsControlDropdown';

type InsightsGroupByDropdownProps = {
    /** Time bucket the headline chart aggregates into */
    groupBy: InsightsFilters['groupBy'];

    onChange: (groupBy: InsightsFilters['groupBy']) => void;
};

/** The headline chart's time bucket. Kept apart from the page controls so it can sit in the chart's own header once that exists. */
function InsightsGroupByDropdown({groupBy, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();

    const items: Array<SingleSelectItem<InsightsFilters['groupBy']>> = INSIGHTS_GROUP_BY_OPTIONS.map((option) => ({
        text: translate(`search.filters.groupBy.${option}`),
        value: option,
    }));
    const selectedItem = items.find((item) => item.value === groupBy);

    const label = translate('search.display.groupBy');

    const groupByPopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={label}
            items={items}
            value={selectedItem}
            defaultValue={DEFAULT_INSIGHTS_FILTERS.groupBy}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(item?.value ?? DEFAULT_INSIGHTS_FILTERS.groupBy)}
        />
    );

    return (
        <InsightsControlDropdown
            label={label}
            value={selectedItem?.text ?? null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_BY}
            PopoverComponent={groupByPopover}
        />
    );
}

export default InsightsGroupByDropdown;
