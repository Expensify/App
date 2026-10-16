import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import type {ComponentRef, ForwardedRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import FormHelpMessage from './FormHelpMessage';
import RadioButtonWithLabel from './RadioButtonWithLabel';

type Choice = {
    label: string;
    value: string;
    style?: StyleProp<ViewStyle>;
};

type RadioButtonsProps = ForwardedFSClassProps & {
    /** List of choices to display via radio buttons */
    items: Choice[];

    defaultCheckedValue?: string;

    /** Callback to fire when selecting a radio button. Inside a form, FormProvider gets the value through onInputChange instead. */
    onSelect?: (value: string) => void;

    /** Potential error text provided by a form InputWrapper */
    errorText?: string;

    /** Callback executed when input value changes (same as onPress, but required by FormProvider for the sake of saving drafts) */
    onInputChange?: (value: string) => void;

    /** The checked value, if you're using this component as a controlled input. */
    value?: string;

    /** The question the buttons answer, read out by screen readers as the name of the group */
    accessibilityLabel?: string;

    /** Style of the group, used instead of its default top margin */
    containerStyle?: StyleProp<ViewStyle>;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function RadioButtons({items, onSelect, defaultCheckedValue = '', errorText, onInputChange = () => {}, value, forwardedFSClass, accessibilityLabel, containerStyle, ref}: RadioButtonsProps) {
    const styles = useThemeStyles();
    const [localValue, setLocalValue] = useState(defaultCheckedValue);
    const checkedValue = value !== undefined ? value : localValue;
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    return (
        <>
            <View
                style={containerStyle ?? styles.mt6}
                ref={ref}
                role={accessibilityLabel ? CONST.ROLE.RADIOGROUP : undefined}
                accessibilityLabel={accessibilityLabel}
            >
                {items.map((item) => (
                    <RadioButtonWithLabel
                        key={item.value}
                        isChecked={item.value === checkedValue}
                        style={[styles.optionRowCompact, styles.ph5]}
                        onPress={() => {
                            setLocalValue(item.value);
                            onInputChange(item.value);
                            return onSelect?.(item.value);
                        }}
                        label={item.label}
                        // Native drops the group's name, since the group is not one element, so each option carries the question
                        accessibilityLabel={accessibilityLabel && !isWeb ? `${item.label}, ${accessibilityLabel}` : undefined}
                        forwardedFSClass={forwardedFSClass}
                    />
                ))}
            </View>
            {!!errorText && <FormHelpMessage message={errorText} />}
        </>
    );
}

export type {Choice};
export default RadioButtons;
