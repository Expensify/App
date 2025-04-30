import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type {DropdownValue} from './DropdownButton';

type MultiSelectItem = {
    translation: TranslationPaths;
    value: string;
};

type MultiSelectPopupProps = {
    items: MultiSelectItem[];
    value: DropdownValue<MultiSelectItem>;
    onChange: (item: DropdownValue<MultiSelectItem>) => void;
};

function MultiSelectPopup({value, items, onChange}: MultiSelectPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // JACK_TODO: Make this actually work
    const [selectedItem, setSelectedItem] = useState(items.at(0)?.value);

    const listData: ListItem[] = useMemo(() => {
        return items.map((item) => ({
            text: translate(item.translation),
            keyForList: item.value,
            isSelected: item.value === selectedItem,
        }));
    }, [items, translate, selectedItem]);

    const updateSelectedItem = useCallback((item: ListItem) => {
        if (!item.keyForList) {
            return;
        }

        setSelectedItem(item.keyForList);
    }, []);

    return (
        <View style={[styles.pv4, styles.gap2]}>
            <SelectionList
                shouldSingleExecuteRowSelect
                sections={[{data: listData}]}
                ListItem={MultiSelectListItem}
                onSelectRow={updateSelectedItem}
            />
            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                />
            </View>
        </View>
    );
}

MultiSelectPopup.displayName = 'MultiSelectPopup';
export default MultiSelectPopup;
