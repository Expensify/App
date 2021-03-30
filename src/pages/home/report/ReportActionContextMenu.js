import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import ReportActionPropTypes from './ReportActionPropTypes';
import Clipboard from '../../../libs/Clipboard';

/**
 * A list of all the context actions in this menu.
 */
const CONTEXT_ACTIONS = [
    // Copy to clipboard
    {
        text: 'Copy to Clipboard',
        icon: ClipboardIcon,
        successText: 'Copied!',
        successIcon: Checkmark,

        // If return value is true, we switch the `text` and `icon` on
        // `ReportActionContextMenuItem` with `successText` and `successIcon` which will fallback to
        // the `text` and `icon`
        onPress: (action) => {
            const lastMessage = _.last(lodashGet(action, 'message', null));
            const html = lodashGet(lastMessage, 'html', '');
            const text = lodashGet(lastMessage, 'text', '');
            const isAttachment = text === '[Attachment]';
            if (!isAttachment) {
                Clipboard.setString(text);
            } else {
                Clipboard.setString(html);
            }
            return true;
        },
    },

    // Copy chat link
    {
        text: 'Copy Link',
        icon: LinkCopy,
        onPress: () => { },
    },

    // Mark as Unread
    {
        text: 'Mark as Unread',
        icon: Mail,
        onPress: () => { },
    },

    // Edit Comment
    {
        text: 'Edit Comment',
        icon: Pencil,
        onPress: () => { },
    },

    // Delete Comment
    {
        text: 'Delete Comment',
        icon: Trashcan,
        onPress: () => { },
    },
];

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The report action this context menu is attached to.
    reportAction: PropTypes.shape(ReportActionPropTypes).isRequired,

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
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini);
    return props.isVisible && (
        <View style={wrapperStyle}>
            {CONTEXT_ACTIONS.map(contextAction => (
                <ReportActionContextMenuItem
                    icon={contextAction.icon}
                    text={contextAction.text}
                    successIcon={contextAction.successIcon}
                    successText={contextAction.successText}
                    isMini={props.isMini}
                    onPress={() => contextAction.onPress(props.reportAction)}
                    key={contextAction.text}
                />
            ))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
