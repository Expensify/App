import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import Tooltip from '../../../components/Tooltip';
import Icon from '../../../components/Icon';
import getReportActionContextMenuItemStyles from '../../../styles/getReportActionContextMenuItemStyles';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import Log from '../../../libs/Log';

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

function buttonPressed() {
    Log.alert('delete pressed',0, {}, false);
    if (props.text === 'Delete Comment') {
        Log.alert('delete pressed',0, {}, false);
    }
}

const propTypes = {
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
    isMini: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
};

const ReportActionContextMenuItem = (props) => {
    const {getButtonStyle, getIconFillColor} = getReportActionContextMenuItemStyles(props.isMini);
    return (
        props.isMini
            ? (
                <Tooltip text={props.text}>
                    <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
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
                    onPress={() => buttonPressed()}
                    style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}
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
