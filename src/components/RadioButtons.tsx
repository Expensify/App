import React, {useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
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

    /** Default checked value */
    defaultCheckedValue?: string;

    /** Callback to fire when selecting a radio button */
    onSelect: (value: string) => void;

    /** Potential error text provided by a form InputWrapper */
    errorText?: string;

    /** Callback executed when input value changes (same as onPress, but required by FormProvider for the sake of saving drafts) */
    onInputChange?: (value: string) => void;

    /** The checked value, if you're using this component as a controlled input. */
    value?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function RadioButtons({items, onSelect, defaultCheckedValue = '', errorText, onInputChange = () => {}, value, forwardedFSClass, ref}: RadioButtonsProps) {
    const styles = useThemeStyles();
    const [localValue, setLocalValue] = useState(defaultCheckedValue);
    const checkedValue = value !== undefined ? value : localValue;

    return (
        <>
            <View
                style={styles.mt6}
                ref={ref}
            >
                {items.map((item) => (
                    <RadioButtonWithLabel
                        key={item.value}
                        isChecked={item.value === checkedValue}
                        style={[styles.optionRowCompact, styles.ph5]}
                        onPress={() => {
                            setLocalValue(item.value);
                            onInputChange(item.value);
                            return onSelect(item.value);
                        }}
                        label={item.label}
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
