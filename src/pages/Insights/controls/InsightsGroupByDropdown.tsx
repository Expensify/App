import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import ListFilterWrapper from '@components/Search/FilterComponents/ListFilterViewWrapper';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS, {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {getFittingGroupBy} from '@pages/Insights/insightsGroupByUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

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
            options={options}
            runningTotalText={runningTotalText}
            selectedValue={selectedValue}
            label={label}
            closeOverlay={closeOverlay}
            onChange={onChange}
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

type InsightsGroupByPopupProps = {
    options: InsightsTimeGroupBy[];
    runningTotalText: string;
    selectedValue: GroupByValue;
    label: string;
    closeOverlay: () => void;
    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsGroupByPopup({options, runningTotalText, selectedValue, label, closeOverlay, onChange}: InsightsGroupByPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selected, setSelected] = useState<GroupByValue>(selectedValue);

    const groupByItems = options.map<ListItem<GroupByValue>>((option) => ({
        text: translate(`search.filters.groupBy.${option}`),
        keyForList: option,
        isSelected: option === selected,
    }));
    const runningTotalItems: Array<ListItem<GroupByValue>> = [
        {text: runningTotalText, keyForList: INSIGHTS_RUNNING_TOTAL_GROUP_BY, isSelected: selected === INSIGHTS_RUNNING_TOTAL_GROUP_BY},
    ];

    // A divider sits above the Running total section, the same way the generic Group by menu separates its sections.
    const sections = [groupByItems, runningTotalItems].map((data, index) => ({
        sectionIndex: index,
        ...(index > 0 ? {customHeader: <View style={styles.dividerLine} />} : {}),
        data,
    }));

    const itemCount = groupByItems.length + runningTotalItems.length + 1;

    const updateSelectedItem = (item: ListItem<GroupByValue>) => {
        setSelected(item.keyForList);
    };

    const applyChanges = () => {
        onChange({groupBy: selected});
        closeOverlay();
    };

    const resetChanges = () => {
        onChange({groupBy: DEFAULT_INSIGHTS_FILTERS.groupBy});
        closeOverlay();
    };

    return (
        <BasePopup
            onReset={resetChanges}
            onApply={applyChanges}
            label={label}
            showLabel={false}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
            <ListFilterHeightContextProvider>
                <ListFilterWrapper
                    itemCount={itemCount}
                    hasHeader
                >
                    <SelectionListWithSections
                        sections={sections}
                        shouldSingleExecuteRowSelect
                        ListItem={SingleSelectListItem}
                        onSelectRow={updateSelectedItem}
                    />
                </ListFilterWrapper>
            </ListFilterHeightContextProvider>
        </BasePopup>
    );
}

export default InsightsGroupByDropdown;
