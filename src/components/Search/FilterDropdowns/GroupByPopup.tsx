import ListFilterWrapper from '@components/Search/FilterComponents/ListFilterViewWrapper';
import type {SearchGroupBy} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {GroupBySection} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import BasePopup from './BasePopup';

type GroupByPopupItem = {
    text: string;
    value: SearchGroupBy;
};

type GroupByPopupProps = {
    sections: GroupBySection[];
    value: GroupByPopupItem | null;
    onBackButtonPress: () => void;
    closeOverlay: () => void;
    onChange: (item: GroupByPopupItem | null) => void;
};

function GroupByPopup({value, sections, onBackButtonPress, closeOverlay, onChange}: GroupByPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedItem, setSelectedItem] = useState(value);

    const allSelectableItems = sections.flatMap((section) => section.options);

    const listSections = sections.map((section) => ({
        sectionIndex: section.sectionIndex,
        ...(section.sectionIndex > 0 ? {customHeader: <View style={styles.dividerLine} />} : {}),
        data: section.options.map<ListItem<SearchGroupBy>>((item) => ({
            text: item.text,
            keyForList: item.value,
            isSelected: item.value === selectedItem?.value,
        })),
    }));

    let sectionItemCount = 0;
    for (const section of listSections) {
        sectionItemCount += section.data.length + (section.data.length > 0 && !!section.customHeader ? 1 : 0);
    }
    const itemCount = Math.max(1, sectionItemCount);

    const updateSelectedItem = (item: ListItem) => {
        const newItem = allSelectableItems.find((option) => option.value === item.keyForList) ?? null;
        setSelectedItem(newItem);
    };

    const applyChanges = () => {
        onChange(selectedItem);
        closeOverlay();
    };

    const resetChanges = () => {
        onChange(null);
        closeOverlay();
    };

    return (
        <BasePopup
            onReset={resetChanges}
            onApply={applyChanges}
            onBackButtonPress={onBackButtonPress}
            label={translate('search.display.groupBy')}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
            <ListFilterWrapper
                itemCount={itemCount}
                hasHeader
            >
                <SelectionListWithSections
                    sections={listSections}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                />
            </ListFilterWrapper>
        </BasePopup>
    );
}

export default GroupByPopup;
