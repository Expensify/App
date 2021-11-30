import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Button from './Button';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Text to display for the main button */
    buttonText: PropTypes.string.isRequired,

    /** Callback to execute when the main button is pressed */
    onButtonPress: PropTypes.func,

    /** Callback to execute when the dropdown element is pressed */
    onDropdownPress: PropTypes.func,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,
};

const defaultProps = {
    onButtonPress: () => {},
    onDropdownPress: () => {},
    isLoading: false,
};

const ButtonWithDropdown = props => (
    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
        <Button
            success
            onPress={props.onButtonPress}
            text={props.buttonText}
            isLoading={props.isLoading}
            shouldRemoveRightBorderRadius
            style={[styles.flex1]}
        />
        <Button
            success
            style={[styles.buttonDropdown]}
            onPress={props.onDropdownPress}
            shouldRemoveLeftBorderRadius
            ContentComponent={() => (
                <Icon src={Expensicons.DownArrow} fill={themeColors.textReversed} />
            )}
        />
    </View>
);

ButtonWithDropdown.propTypes = propTypes;
ButtonWithDropdown.defaultProps = defaultProps;
ButtonWithDropdown.displayName = 'ButtonWithDropdown';
export default ButtonWithDropdown;
