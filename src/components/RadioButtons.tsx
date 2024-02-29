import React, {forwardRef, useEffect, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MaybePhraseKey} from '@libs/Localize';
import FormHelpMessage from './FormHelpMessage';
import RadioButtonWithLabel from './RadioButtonWithLabel';

type Choice = {
    label: string;
    value: string;
    style?: StyleProp<ViewStyle>;
};

type RadioButtonsProps = {
    /** List of choices to display via radio buttons */
    items: Choice[];

    /** Default checked value */
    defaultCheckedValue?: string;

    /** Callback to fire when selecting a radio button */
    onPress: (value: string) => void;

    /** Potential error text provided by a form InputWrapper */
    errorText?: MaybePhraseKey;

    /** Style for radio button */
    radioButtonStyle?: StyleProp<ViewStyle>;

    /** Callback executed when input value changes (same as onPress, but required by FormProvider for the sake of saving drafts) */
    onInputChange?: (value: string) => void;

    /** The checked value, if you're using this component as a controlled input. */
    value?: string;
};

function RadioButtons({items, onPress, defaultCheckedValue = '', radioButtonStyle, errorText, onInputChange = () => {}, value}: RadioButtonsProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const [checkedValue, setCheckedValue] = useState(defaultCheckedValue);

    useEffect(() => {
        if (value === checkedValue || value === undefined) {
            return;
        }
        setCheckedValue(value ?? '');
    }, [checkedValue, value]);

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
                        style={[styles.mb4, radioButtonStyle]}
                        onPress={() => {
                            setCheckedValue(item.value);
                            onInputChange(item.value);
                            return onPress(item.value);
                        }}
                        label={item.label}
                    />
                ))}
            </View>
            {!!errorText && <FormHelpMessage message={errorText} />}
        </>
    );
}

RadioButtons.displayName = 'RadioButtons';

export type {Choice};
export default forwardRef(RadioButtons);
