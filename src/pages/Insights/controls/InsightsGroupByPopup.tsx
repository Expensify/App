/** Shares the ranking and time-grouping menus' radio rows, Reset/Apply actions, and mobile sheet. */
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import ListFilterWrapper from '@components/Search/FilterComponents/ListFilterViewWrapper';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React, {useState} from 'react';
import {View} from 'react-native';

type InsightsGroupByPopupProps<T extends string> = {
    optionGroups: Array<Array<{value: T; label: string}>>;
    selectedValue: T;
    defaultValue: T;
    label: string;
    resetSentryLabel: SentryLabel;
    applySentryLabel: SentryLabel;
    closeOverlay: () => void;
    onChange: (value: T) => void;
};

function InsightsGroupByPopup<T extends string>({
    optionGroups,
    selectedValue,
    defaultValue,
    label,
    resetSentryLabel,
    applySentryLabel,
    closeOverlay,
    onChange,
}: InsightsGroupByPopupProps<T>) {
    const styles = useThemeStyles();
    const [selected, setSelected] = useState(selectedValue);
    const sections = optionGroups.map((options, sectionIndex) => ({
        sectionIndex,
        ...(sectionIndex > 0 ? {customHeader: <View style={styles.dividerLine} />} : {}),
        data: options.map<ListItem<T>>(({value, label: text}) => ({text, keyForList: value, isSelected: value === selected})),
    }));
    const updateSelectedItem = (item: ListItem<T>) => setSelected(item.keyForList);
    const applyChanges = () => {
        onChange(selected);
        closeOverlay();
    };
    const resetChanges = () => {
        onChange(defaultValue);
        closeOverlay();
    };

    return (
        <BasePopup
            onReset={resetChanges}
            onApply={applyChanges}
            label={label}
            showLabel={false}
            resetSentryLabel={resetSentryLabel}
            applySentryLabel={applySentryLabel}
        >
            <ListFilterHeightContextProvider>
                <ListFilterWrapper
                    itemCount={optionGroups.reduce((count, options) => count + options.length, optionGroups.length - 1)}
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

export default InsightsGroupByPopup;
