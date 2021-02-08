import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../components/Icon/Expensicons';
import styles from '../../../styles/styles';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import getButtonState from '../../../libs/getButtonState';
import Icon from '../../../components/Icon';
import Tooltip from '../../../components/Tooltip';

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
    shouldShow: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    shouldShow: false,
};

const ReportActionContextMenu = (props) => {
    const {wrapperStyle, getButtonStyle, getIconFillColor} = getReportActionContextMenuStyles(props.isMini);
    return props.shouldShow && (
        <View style={[
            ...wrapperStyle,
            styles.flex1,
        ]}
        >
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
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
