import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS, {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {getFittingGroupBy} from '@pages/Insights/insightsGroupByUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';
import InsightsGroupByPopup from './InsightsGroupByPopup';

type GroupByValue = InsightsFilters['groupBy'];

type InsightsGroupByDropdownProps = {
    /** Current grouping selection, which is Running total when the chart accumulates spend across the range. */
    groupBy: GroupByValue;

    /** Per-period time buckets that fit the date range */
    options: InsightsTimeGroupBy[];

    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsGroupByDropdown({groupBy, options, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const label = translate('search.display.groupBy');
    const runningTotalText = translate('insightsPage.runningTotal');
    const isRunningTotal = groupBy === INSIGHTS_RUNNING_TOTAL_GROUP_BY;
    // The stored bucket may no longer fit the date range, so the pill and radio follow the one it fits to.
    const fittedGroupBy = getFittingGroupBy(groupBy, options);
    const selectedValue: GroupByValue = isRunningTotal ? INSIGHTS_RUNNING_TOTAL_GROUP_BY : fittedGroupBy;
    const pillText = translate(`search.filters.groupBy.${fittedGroupBy}`);

    const groupByPopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsGroupByPopup
            optionGroups={[options.map((value) => ({value, label: translate(`search.filters.groupBy.${value}`)})), [{value: INSIGHTS_RUNNING_TOTAL_GROUP_BY, label: runningTotalText}]]}
            selectedValue={selectedValue}
            defaultValue={DEFAULT_INSIGHTS_FILTERS.groupBy}
            label={label}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.GROUP_BY}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.GROUP_BY}
            closeOverlay={closeOverlay}
            onChange={(value: GroupByValue) => onChange({groupBy: value})}
        />
    );

    return (
        <DropdownButton
            // The pill reads the selection alone, without a `Group by` prefix, so `label` only titles the popup
            label={isRunningTotal ? runningTotalText : pillText}
            value={null}
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
