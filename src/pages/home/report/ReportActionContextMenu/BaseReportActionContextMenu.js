import React from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './ReportActionContextMenuPropTypes';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';

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

const BaseReportActionContextMenu = (props) => {
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini);
    return props.isVisible && (
        <View style={wrapperStyle}>
            {CONTEXT_ACTIONS.map(contextAction => (
                <ReportActionContextMenuItem
                    icon={contextAction.icon}
                    text={contextAction.text}
                    isMini={props.isMini}
                    key={contextAction.text}
                />
            ))}
        </View>
    );
};

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;
BaseReportActionContextMenu.displayName = 'BaseReportActionContextMenu';

export default BaseReportActionContextMenu;
