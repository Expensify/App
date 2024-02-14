import React, {forwardRef, useState} from 'react';
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
};

function RadioButtons({items, onPress, defaultCheckedValue = '', radioButtonStyle, errorText}: RadioButtonsProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const [checkedValue, setCheckedValue] = useState(defaultCheckedValue);

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
