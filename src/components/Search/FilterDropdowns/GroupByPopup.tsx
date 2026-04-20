import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {SearchGroupBy} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {GroupBySection} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import BasePopup from './BasePopup';

type GroupByPopupItem = {
    text: string;
    value: SearchGroupBy;
};

type GroupByPopupProps = {
    /** The label to show when in an overlay on mobile */
    label?: string;

    /** The grouped options to show in the list */
    sections: GroupBySection[];

    /** The currently selected item */
    value: GroupByPopupItem | null;

    style?: StyleProp<ViewStyle>;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: GroupByPopupItem | null) => void;
};

function GroupByPopup({label, value, sections, style, closeOverlay, onChange}: GroupByPopupProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const [selectedItem, setSelectedItem] = useState(value);

    const allSelectableItems = useMemo(() => sections.flatMap((section) => section.options), [sections]);

    const listSections = useMemo(
        () =>
            sections.map((section) => ({
                sectionIndex: section.sectionIndex,
                ...(section.sectionIndex > 0 ? {customHeader: <View style={styles.dividerLine} />} : {}),
                data: section.options.map<ListItem<SearchGroupBy>>((item) => ({
                    text: item.text,
                    keyForList: item.value,
                    isSelected: item.value === selectedItem?.value,
                })),
            })),
        [sections, selectedItem?.value, styles.dividerLine],
    );

    const optionsCount = Math.max(
        1,
        listSections.reduce((count, section) => count + section.data.length + (section.data.length > 0 && !!section.customHeader ? 1 : 0), 0),
    );

    const updateSelectedItem = useCallback(
        (item: ListItem) => {
            const newItem = allSelectableItems.find((option) => option.value === item.keyForList) ?? null;
            setSelectedItem(newItem);
        },
        [allSelectableItems],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        onChange(null);
        closeOverlay();
    }, [closeOverlay, onChange]);

    const shouldShowLabel = isSmallScreenWidth && !!label;

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
            style={style}
        >
            <View style={[styles.getSelectionListPopoverHeight(optionsCount, windowHeight, false, isInLandscapeMode, shouldShowLabel)]}>
                <SelectionListWithSections
                    sections={listSections}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                />
            </View>
        </BasePopup>
    );
}

export default GroupByPopup;
