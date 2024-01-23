import React, {useState} from 'react';
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

    /** Callback to fire when selecting a radio button */
    onPress: (value: string) => void;

    /** Potential error text provided by a form InputWrapper */
    errorText?: MaybePhraseKey;
};

function RadioButtons({items, onPress, errorText}: RadioButtonsProps) {
    const styles = useThemeStyles();
    const [checkedValue, setCheckedValue] = useState('');

    return (
        <>
            <View style={styles.mb3}>
                {items.map((item) => (
                    <RadioButtonWithLabel
                        key={item.value}
                        isChecked={item.value === checkedValue}
                        style={[styles.mt4, item.style]}
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
export default RadioButtons;
