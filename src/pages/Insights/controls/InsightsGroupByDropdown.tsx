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
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

/** Radio value that stands for Running total, which sits in its own section rather than being a time bucket. */
const RUNNING_TOTAL_VALUE = 'runningTotal';

type GroupByValue = InsightsFilters['groupBy'] | typeof RUNNING_TOTAL_VALUE;

type InsightsGroupByDropdownProps = {
    /** Time bucket the headline chart aggregates into, which the radio pre-selects when Running total is off */
    groupBy: InsightsFilters['groupBy'];

    /** Options that fit the date range */
    options: Array<InsightsFilters['groupBy']>;

    /** Whether Running total is the current selection */
    shouldShowRunningTotal: boolean;

    onChange: (update: Partial<InsightsFilters>) => void;
};

/** Maps a radio choice back to the filters it stores: Running total keeps the time bucket so turning it off returns to it. */
function toFilters(value: GroupByValue): Partial<InsightsFilters> {
    if (value === RUNNING_TOTAL_VALUE) {
        return {shouldShowRunningTotal: true};
    }
    return {groupBy: value, shouldShowRunningTotal: false};
}

function InsightsGroupByDropdown({groupBy, options, shouldShowRunningTotal, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const label = translate('search.display.groupBy');
    const runningTotalText = translate('insightsPage.runningTotal');
    const selectedValue: GroupByValue = shouldShowRunningTotal ? RUNNING_TOTAL_VALUE : groupBy;
    const pillText = shouldShowRunningTotal ? runningTotalText : translate(`search.filters.groupBy.${groupBy}`);

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
            label={label}
            value={pillText}
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
    options: Array<InsightsFilters['groupBy']>;
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
    const runningTotalItems: Array<ListItem<GroupByValue>> = [{text: runningTotalText, keyForList: RUNNING_TOTAL_VALUE, isSelected: selected === RUNNING_TOTAL_VALUE}];

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
        onChange(toFilters(selected));
        closeOverlay();
    };

    const resetChanges = () => {
        onChange({groupBy: DEFAULT_INSIGHTS_FILTERS.groupBy, shouldShowRunningTotal: false});
        closeOverlay();
    };

    return (
        <BasePopup
            onReset={resetChanges}
            onApply={applyChanges}
            label={label}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
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
        </BasePopup>
    );
}

export default InsightsGroupByDropdown;
