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

    /** Default checked value */
    defaultCheckedValue?: string;

    /** Callback to fire when selecting a radio button */
    onPress: (value: string) => void;
};

function RadioButtons({items, onPress, defaultCheckedValue = ''}: RadioButtonsProps) {
    const styles = useThemeStyles();
    const [checkedValue, setCheckedValue] = useState(defaultCheckedValue);

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
