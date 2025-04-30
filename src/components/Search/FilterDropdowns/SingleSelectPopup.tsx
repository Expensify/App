import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type {DropdownValue} from './DropdownButton';

type SingleSelectItem = {
    translation: TranslationPaths;
    value: string;
};

type SingleSelectPopupProps = {
    items: SingleSelectItem[];
    value: DropdownValue<SingleSelectItem>;
    onChange: (item: DropdownValue<SingleSelectItem>) => void;
};

function SingleSelectPopup({value, items, onChange}: SingleSelectPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedItem, setSelectedItem] = useState(value);

    const listData: ListItem[] = useMemo(() => {
        return items.map((item) => ({
            text: translate(item.translation),
            keyForList: item.value,
            isSelected: !Array.isArray(selectedItem) && item.value === selectedItem?.value,
        }));
    }, [items, translate, selectedItem]);

    const updateSelectedItem = useCallback(
        (item: ListItem) => {
            const newItem = items.find((i) => i.value === item.keyForList) ?? null;
            setSelectedItem(newItem);
        },
        [items],
    );

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
    }, [onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        setSelectedItem(value);
        onChange(null);
    }, [onChange, value]);

    return (
        <View style={[styles.pv4, styles.gap2]}>
            <SelectionList
                shouldSingleExecuteRowSelect
                sections={[{data: listData}]}
                ListItem={SingleSelectListItem}
                onSelectRow={updateSelectedItem}
            />
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

SingleSelectPopup.displayName = 'SingleSelectPopup';
export type {SingleSelectPopupProps, SingleSelectItem};
export default SingleSelectPopup;
