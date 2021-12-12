import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Whether SelectCircle is checked */
    isChecked: PropTypes.bool,
};

const defaultProps = {
    isChecked: false,
};

const SelectCircle = props => (
    <View style={[styles.selectCircle, styles.alignSelfCenter]}>
        {props.isChecked && (
            <Icon src={Expensicons.Checkmark} fill={themeColors.iconSuccessFill} />
        )}
    </View>
);

SelectCircle.propTypes = propTypes;
SelectCircle.defaultProps = defaultProps;
SelectCircle.displayName = 'SelectCircle';

export default SelectCircle;
