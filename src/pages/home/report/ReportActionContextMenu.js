import React from 'react';
import {Pressable, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import Icon from '../../../components/Icon';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';

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

/**
 * A list of all the context actions in this menu.
 */
const CONTEXT_ACTIONS = [
    // Copy to clipboard
    {
        text: 'Copy to Clipboard',
        icon: Clipboard,
    },

    // Copy chat link
    {
        text: 'Copy Link',
        icon: LinkCopy,
    },

    // Mark as Unread
    {
        text: 'Mark as Unread',
        icon: Mail,
    },

    // Edit Comment
    {
        text: 'Edit Comment',
        icon: Pencil,
    },

    // Delete Comment
    {
        text: 'Delete Comment',
        icon: Trashcan,
    },
];

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The ID of the report action this context menu is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.number.isRequired,

    // If true, this component will be a small, row-oriented menu that displays icons but not text.
    // If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row.
    isMini: PropTypes.bool,

    // Controls the visibility of this component.
    isVisible: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
};

const ReportActionContextMenu = (props) => {
    const {
        wrapperStyle,
        getButtonStyle,
        getIconFillColor,
        getTextStyle,
    } = getReportActionContextMenuStyles(props.isMini);
    return props.isMini
        ? props.isVisible && (
            <View style={wrapperStyle}>
                {CONTEXT_ACTIONS.map(contextAction => (
                    <Tooltip
                        text={contextAction.text}
                        key={contextAction.text}
                    >
                        <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
                            {({hovered, pressed}) => (
                                <Icon
                                    src={contextAction.icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            )}
                        </Pressable>
                    </Tooltip>
                ))}
            </View>
        ) : props.isVisible && (
            <View style={wrapperStyle}>
                {CONTEXT_ACTIONS.map(contextAction => (
                    <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
                        {({hovered, pressed}) => (
                            <>
                                <Icon
                                    src={contextAction.icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed))}
                                />
                                <Text style={getTextStyle(getButtonState(hovered, pressed))}>{contextAction.text}</Text>
                            </>
                        )}
                    </Pressable>
                ))}
            </View>
        );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
