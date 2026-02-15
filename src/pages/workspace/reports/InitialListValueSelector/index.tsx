import type {ForwardedRef} from 'react';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useOnyx from '@hooks/useOnyx';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import InitialListValueSelectorModal from './InitialListValueSelectorModal';

type InitialListValueSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    /** Currently selected value */
    value?: string;

    /** Subtitle to display on field */
    subtitle?: string;

    /** Function to call when the user selects a value */
    onInputChange?: (value: string) => void;

    /** Reference to the outer element */
    ref: ForwardedRef<View>;
};

function InitialListValueSelector({value = '', label = '', rightLabel, subtitle = '', errorText = '', onInputChange, ref}: InitialListValueSelectorProps) {
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
        blurActiveElement();
    };

    const updateValueInput = (initialValue: string) => {
        onInputChange?.(value === initialValue ? '' : initialValue);
        hidePickerModal();
    };

    useEffect(() => {
        const currentValueIndex = Object.values(formDraft?.listValues ?? {}).findIndex((listValue) => listValue === value);
        const isCurrentValueDisabled = formDraft?.disabledListValues?.[currentValueIndex] ?? true;

        if (isCurrentValueDisabled && value !== '') {
            onInputChange?.('');
        }
    }, [formDraft?.disabledListValues, formDraft?.listValues, onInputChange, value]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={value}
                description={label}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                onPress={showPickerModal}
            />
            <InitialListValueSelectorModal
                isVisible={isPickerVisible}
                currentValue={value}
                onClose={hidePickerModal}
                onValueSelected={updateValueInput}
                label={label}
                subtitle={subtitle}
            />
        </View>
    );
}

export default InitialListValueSelector;
