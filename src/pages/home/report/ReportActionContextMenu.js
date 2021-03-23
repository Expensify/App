import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import {editReportComment, saveReportActionDraft} from '../../../libs/actions/Report';
import ReportActionPropTypes from './ReportActionPropTypes';

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The ID of the report action this context menu is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
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

class ReportActionContextMenu extends React.Component {
    /**
     * A list of all the context actions in this menu.
     */
    CONTEXT_ACTIONS = [
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
            callback: () => {
                // editReportComment(this.props.reportID, this.props.reportAction, "blah blah Yuwen test 21");
                saveReportActionDraft(this.props.reportID, this.props.reportAction.reportActionID, "blah blah Yuwen test 21");
            },
        },

        // Delete Comment
        {
            text: 'Delete Comment',
            icon: Trashcan,
        },
    ];

    render() {
        const wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);
        return this.props.isVisible && (
            <View style={wrapperStyle}>
                {this.CONTEXT_ACTIONS.map(contextAction => (
                    <ReportActionContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        isMini={this.props.isMini}
                        key={contextAction.text}
                        onPressOut={contextAction.callback}
                    />
                ))}
            </View>
        );
    }
}

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
