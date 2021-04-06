import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import ONYXKEYS from '../../../ONYXKEYS';
import Log from '../../../libs/Log';

let reportID;
let reportActionID;

/**
 * A list of all the context actions in this menu.
 */
const CONTEXT_ACTIONS = [
    // Copy to clipboard
    {
        text: 'Copy to Clipboard',
        icon: Clipboard,
        onPress: () => {
        },
    },

    // Copy chat link
    {
        text: 'Copy Link',
        icon: LinkCopy,
        onPress: () => {
        },
    },

    // Mark as Unread
    {
        text: 'Mark as Unread',
        icon: Mail,
        onPress: () => {
        },
    },

    // Edit Comment
    {
        text: 'Edit Comment',
        icon: Pencil,
        onPress: () => {
        },
    },

    // Delete Comment
    {
        text: 'Delete Comment',
        icon: Trashcan,

        onClick: () => {
            Log.info('delete pressed', true);
            Onyx.merge(ONYXKEYS.COLLECTION.REPORT_DELETE_COMMENT, {reportID, reportActionID});
        },
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
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini);
    reportID = props.reportID;
    reportActionID = props.reportActionID;
    return props.isVisible && (
        <View style={wrapperStyle}>
            {CONTEXT_ACTIONS.map(contextAction => (
                <ReportActionContextMenuItem
                    icon={contextAction.icon}
                    text={contextAction.text}
                    isMini={props.isMini}
                    onClick={contextAction.onClick}
                />
            ))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
