import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
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

    /** Grouping the dashboard starts from, which Reset returns to */
    defaultGroupBy: GroupByValue;

    /** Whether Running total is offered, which it isn't for charts that can't plot it */
    shouldShowRunningTotalOption: boolean;

    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsGroupByDropdown({groupBy, options, defaultGroupBy, shouldShowRunningTotalOption, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const label = translate('search.display.groupBy');
    const runningTotalText = translate('insightsPage.runningTotal');
    const isRunningTotal = shouldShowRunningTotalOption && groupBy === INSIGHTS_RUNNING_TOTAL_GROUP_BY;
    // The stored bucket may no longer fit the date range, so the pill and radio follow the one it fits to.
    const fittedGroupBy = getFittingGroupBy(groupBy, options);
    const selectedValue: GroupByValue = isRunningTotal ? INSIGHTS_RUNNING_TOTAL_GROUP_BY : fittedGroupBy;
    const pillText = translate(`search.filters.groupBy.${fittedGroupBy}`);

    const optionGroups: Array<Array<{value: GroupByValue; label: string}>> = [
        options.map((value) => ({
            value,
            label: translate(`search.filters.groupBy.${value}`),
        })),
    ];
    if (shouldShowRunningTotalOption) {
        optionGroups.push([{value: INSIGHTS_RUNNING_TOTAL_GROUP_BY, label: runningTotalText}]);
    }

    const groupByPopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsGroupByPopup
            optionGroups={optionGroups}
            selectedValue={selectedValue}
            defaultValue={defaultGroupBy}
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
