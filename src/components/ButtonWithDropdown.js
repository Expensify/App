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

    /** Should the button be disabled */
    isDisabled: PropTypes.bool,
};

const defaultProps = {
    onButtonPress: () => {},
    onDropdownPress: () => {},
    isDisabled: false,
    isLoading: false,
};

const ButtonWithDropdown = props => (
    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
        <Button
            success
            onPress={props.onButtonPress}
            text={props.buttonText}
            isDisabled={props.isDisabled}
            isLoading={props.isLoading}
            shouldRemoveRightBorderRadius
            style={[styles.flex1]}
            useRoundedFocusBorder={false}
            pressOnEnter
        />
        <Button
            success
            isDisabled={props.isDisabled}
            style={[styles.buttonDropdown]}
            onPress={props.onDropdownPress}
            shouldRemoveLeftBorderRadius
            useRoundedFocusBorder={false}
            ContentComponent={() => (
                <Icon src={Expensicons.DownArrow} fill={themeColors.textLight} />
            )}
        />
    </View>
);

ButtonWithDropdown.propTypes = propTypes;
ButtonWithDropdown.defaultProps = defaultProps;
ButtonWithDropdown.displayName = 'ButtonWithDropdown';
export default ButtonWithDropdown;
