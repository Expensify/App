import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';

const propTypes = {
    /** Component to display for label */
    LabelComponent: PropTypes.func.isRequired,

    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: [],
};

const CheckboxWithLabel = ({
    LabelComponent, isChecked, onPress, style,
}) => {
    const defaultStyles = [styles.flexRow];
    const wrapperStyles = _.isArray(style) ? [...defaultStyles, ...style] : [...defaultStyles, style];
    return (
        <View style={wrapperStyles}>
            <Checkbox
                isChecked={isChecked}
                onPress={onPress}
            />
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.ml2,
                    styles.pr2,
                    styles.w100,
                    styles.flexRow,
                    styles.flexWrap,
                    styles.alignItemsCenter,
                ]}
            >
                <LabelComponent />
            </TouchableOpacity>
        </View>
    );
};

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

export default CheckboxWithLabel;
