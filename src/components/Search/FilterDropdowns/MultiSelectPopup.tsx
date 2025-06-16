import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type MultiSelectItem<T> = {
    translation: TranslationPaths;
    value: T;
};

type MultiSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The list of all items to show up in the list */
    items: Array<MultiSelectItem<T>>;

    /** The currently selected items */
    value: Array<MultiSelectItem<T>>;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: Array<MultiSelectItem<T>>) => void;
};

function MultiSelectPopup<T extends string>({label, value, items, closeOverlay, onChange}: MultiSelectPopupProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [selectedItems, setSelectedItems] = useState(value);

    const listData: ListItem[] = useMemo(() => {
        return items.map((item) => ({
            text: translate(item.translation),
            keyForList: item.value,
            isSelected: !!selectedItems.find((i) => i.value === item.value),
        }));
    }, [items, selectedItems, translate]);

    const updateSelectedItems = useCallback(
        (item: ListItem) => {
            if (item.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i.value !== item.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value === item.keyForList);

            if (newItem) {
                setSelectedItems([...selectedItems, newItem]);
            }
        },
        [items, selectedItems],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItems);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItems]);

    const resetChanges = useCallback(() => {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View style={[styles.getSelectionListPopoverHeight(items.length)]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: listData}]}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                />
            </View>

            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

MultiSelectPopup.displayName = 'MultiSelectPopup';
export type {MultiSelectItem};
export default MultiSelectPopup;
