import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import Tooltip from '../../../components/Tooltip';
import Icon from '../../../components/Icon';
import getReportActionContextMenuItemStyles from '../../../styles/getReportActionContextMenuItemStyles';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

/**
 * Get the string representation of a button's state.
 *
 * @param {Boolean} [isHovered]
 * @param {Boolean} [isPressed]
 * @returns {String}
 */
function getButtonState(isHovered = false, isPressed = false) {
    if (isPressed) {
        return CONST.BUTTON_STATES.PRESSED;
    }

    if (isHovered) {
        return CONST.BUTTON_STATES.HOVERED;
    }

    return CONST.BUTTON_STATES.DEFAULT;
}

const propTypes = {

    // Icon to display in the menu
    icon: PropTypes.elementType.isRequired,

    // Text for the action
    text: PropTypes.string.isRequired,

    // If true, we are displaying the mini hover-menu
    isMini: PropTypes.bool,

    // Function to trigger when the action is pressed
    onPress: PropTypes.func,
};

const defaultProps = {
    isMini: false,
    onPress: () => {},
};

const ReportActionContextMenuItem = (props) => {
    const {getButtonStyle, getIconFillColor} = getReportActionContextMenuItemStyles(props.isMini);
    return (
        props.isMini
            ? (
                <Tooltip text={props.text}>
                    <Pressable
                        style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}
                        onPress={props.onPress}
                    >
                        {({hovered, pressed}) => (
                            <Icon
                                src={props.icon}
                                fill={getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        )}
                    </Pressable>
                </Tooltip>
            ) : (
                <Pressable
                    style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}
                    onPress={props.onPress}
                >
                    {({hovered, pressed}) => (
                        <>
                            <Icon
                                src={props.icon}
                                fill={getIconFillColor(getButtonState(hovered, pressed))}
                            />
                            <Text
                                style={styles.reportActionContextMenuText}
                                selectable={false}
                            >
                                {props.text}
                            </Text>
                        </>
                    )}
                </Pressable>
            )
    );
};


ReportActionContextMenuItem.propTypes = propTypes;
ReportActionContextMenuItem.defaultProps = defaultProps;
ReportActionContextMenuItem.displayName = 'ReportActionContextMenuItem';

export default memo(ReportActionContextMenuItem);
