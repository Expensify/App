import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import {getFittingGroupBy} from '@pages/Insights/insightsGroupByUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

type InsightsGroupByDropdownProps = {
    /** Time bucket the headline chart aggregates into */
    groupBy: InsightsFilters['groupBy'];

    /** Options that fit the date range */
    options: Array<InsightsFilters['groupBy']>;

    onChange: (groupBy: InsightsFilters['groupBy']) => void;
};

function InsightsGroupByDropdown({groupBy, options, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultGroupBy = getFittingGroupBy(DEFAULT_INSIGHTS_FILTERS.groupBy, options);

    const items: Array<SingleSelectItem<InsightsFilters['groupBy']>> = options.map((option) => ({
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
            defaultValue={defaultGroupBy}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(item?.value ?? defaultGroupBy)}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={selectedItem?.text ?? null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_BY}
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={groupByPopover}
        />
    );
}

export default InsightsGroupByDropdown;
