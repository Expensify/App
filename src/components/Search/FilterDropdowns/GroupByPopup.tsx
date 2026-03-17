import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {SearchGroupBy} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {GroupBySection} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

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

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: GroupByPopupItem | null) => void;
};

function GroupByPopup({label, value, sections, closeOverlay, onChange}: GroupByPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
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

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && !!label && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(optionsCount, windowHeight, false)]}>
                <SelectionListWithSections
                    sections={listSections}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                />
            </View>

            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
                />
            </View>
        </View>
    );
}

export default GroupByPopup;
