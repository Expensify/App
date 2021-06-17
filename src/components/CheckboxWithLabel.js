import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity, Pressable} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Text that appears next to check box */
    label: PropTypes.string,

    /** Component to display for label */
    LabelComponent: PropTypes.func,
};

const defaultProps = {
    style: [],
    label: undefined,
    LabelComponent: undefined,
};

const CheckboxWithLabel = ({
    LabelComponent, isChecked, onPress, style, label,
}) => {
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];
    const wrapperStyles = _.isArray(style) ? [...defaultStyles, ...style] : [...defaultStyles, style];

    if (!label && !LabelComponent) {
        throw new Error('Must provide at least label or LabelComponent prop');
    }

    return (
        <View style={wrapperStyles}>
            <Checkbox
                isChecked={isChecked}
                onPress={() => onPress(!isChecked)}
                label={label}
            />
            <TouchableOpacity
                onPress={() => onPress(!isChecked)}
                style={[
                    styles.ml2,
                    styles.pr2,
                    styles.w100,
                    styles.flexRow,
                    styles.flexWrap,
                    styles.alignItemsCenter,
                ]}
            >
                {label && (
                    <Text style={[styles.ml2, styles.textP]}>
                        {label}
                    </Text>
                )}
                {LabelComponent && (<LabelComponent />)}
            </TouchableOpacity>
        </View>
    );
};

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

export default CheckboxWithLabel;
