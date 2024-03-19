import Str from 'expensify-common/lib/str';
import React, {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';

type UnitItemType = {
    value: Unit;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type UnitPickerProps = {
    defaultValue: Unit;
    onOptionSelected: (unit: UnitItemType) => void;
};

function UnitPicker({defaultValue, onOptionSelected}: UnitPickerProps) {
    const {translate} = useLocalize();
    const unitItems = useMemo(
        () => ({
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: translate('common.kilometers'),
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: translate('common.miles'),
        }),
        [translate],
    );

    const unitOptions = useMemo(() => {
        const arr: UnitItemType[] = [];
        Object.entries(unitItems).forEach(([unit, label]) => {
            arr.push({
                value: unit as Unit,
                text: Str.recapitalize(label),
                keyForList: unit,
                isSelected: defaultValue === unit,
            });
        });
        return arr;
    }, [defaultValue, unitItems]);

    return (
        <SelectionList
            sections={[{data: unitOptions}]}
            ListItem={RadioListItem}
            onSelectRow={onOptionSelected}
            initiallyFocusedOptionKey={unitOptions.find((unit) => unit.isSelected)?.keyForList}
        />
    );
}

export default UnitPicker;

export type {UnitItemType};
