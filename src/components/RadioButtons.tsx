import React, {useState} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import RadioButtonWithLabel from './RadioButtonWithLabel';

type Choice = {
    label: string;
    value: string;
};

type RadioButtonsProps = {
    /** List of choices to display via radio buttons */
    items: Choice[];

    /** Callback to fire when selecting a radio button */
    onPress: (value: string) => void;
};

function RadioButtons({items, onPress}: RadioButtonsProps) {
    const styles = useThemeStyles();
    const [checkedValue, setCheckedValue] = useState('');

    return (
        <View>
            {items.map((item) => (
                <RadioButtonWithLabel
                    key={item.value}
                    isChecked={item.value === checkedValue}
                    style={styles.mt4}
                    onPress={() => {
                        setCheckedValue(item.value);
                        return onPress(item.value);
                    }}
                    label={item.label}
                />
            ))}
        </View>
    );
}

RadioButtons.displayName = 'RadioButtons';

export default RadioButtons;
