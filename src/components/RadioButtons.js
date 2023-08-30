import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import RadioButtonWithLabel from './RadioButtonWithLabel';
import styles from '../styles/styles';

const propTypes = {
    /** List of choices to display via radio buttons */
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    ).isRequired,

    /** Callback to fire when selecting a radio button */
    onPress: PropTypes.func.isRequired,
};

function RadioButtons(props) {
    const [checkedValue, setCheckedValue] = useState('');

    return (
        <View>
            {_.map(props.items, (item, index) => (
                <RadioButtonWithLabel
                    key={`${item.label}-${index}`}
                    isChecked={item.value === checkedValue}
                    style={[styles.mt4]}
                    onPress={() => {
                        setCheckedValue(item.value);
                        return props.onPress(item.value);
                    }}
                    label={item.label}
                />
            ))}
        </View>
    );
}

RadioButtons.propTypes = propTypes;
RadioButtons.displayName = 'RadioButtons';

export default RadioButtons;
