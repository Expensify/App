import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import {saveReportActionDraft} from '../../../libs/actions/Report';
import ReportActionPropTypes from './ReportActionPropTypes';
import Clipboard from '../../../libs/Clipboard';
import {isReportMessageAttachment} from '../../../libs/reportUtils';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The report action this context menu is attached to.
    reportAction: PropTypes.shape(ReportActionPropTypes),

    // If true, this component will be a small, row-oriented menu that displays icons but not text.
    // If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row.
    isMini: PropTypes.bool,

    // Controls the visibility of this component.
    isVisible: PropTypes.bool,

    /* Onyx Props */
    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),

    // Draft message - if this is set the comment is in 'edit' mode
    draftMessage: PropTypes.string,
};

const defaultProps = {
    reportAction: {},
    isMini: false,
    isVisible: false,
    session: {},
};

class ReportActionContextMenu extends React.Component {
    /**
     * A list of all the context actions in this menu.
     */
    CONTEXT_ACTIONS = [
        // Copy to clipboard
        {
            text: 'Copy to Clipboard',
            icon: ClipboardIcon,
            successText: 'Copied!',
            successIcon: Checkmark,
            shouldShow: true,

            // If return value is true, we switch the `text` and `icon` on
            // `ReportActionContextMenuItem` with `successText` and `successIcon` which will fallback to
            // the `text` and `icon`
            onPress: (action) => {
                const message = _.last(lodashGet(action, 'message', null));
                const html = lodashGet(message, 'html', '');
                const text = lodashGet(message, 'text', '');
                const isAttachment = _.has(action, 'isAttachment')
                    ? action.isAttachment
                    : isReportMessageAttachment(text);
                if (!isAttachment) {
                    Clipboard.setString(text);
                } else {
                    Clipboard.setString(html);
                }
            },
        },

        // Copy chat link
        {
            text: 'Copy Link',
            icon: LinkCopy,
            shouldShow: false,
            onPress: () => {},
        },

        // Mark as Unread
        {
            text: 'Mark as Unread',
            icon: Mail,
            shouldShow: false,
            onPress: () => {},
        },

        // Edit Comment
        {
            text: 'Edit Comment',
            icon: Pencil,
            shouldShow: this.props.reportAction.actorEmail === this.props.session.email
                && !isReportMessageAttachment(this.getActionText()),
            onPress: () => {
                saveReportActionDraft(
                    this.props.reportID,
                    this.props.reportAction.reportActionID,
                    _.isEmpty(this.props.draftMessage) ? this.getActionText() : '',
                );
            },
        },

        // Delete Comment
        {
            text: 'Delete Comment',
            icon: Trashcan,
            shouldShow: false,
            onPress: () => {},
        },
    ];

    getActionText() {
        const message = _.last(lodashGet(this.props.reportAction, 'message', null));
        return lodashGet(message, 'text', '');
    }

    render() {
        const wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);
        return this.props.isVisible && (
            <View style={wrapperStyle}>
                {this.CONTEXT_ACTIONS.map(contextAction => contextAction.shouldShow && (
                    <ReportActionContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successText}
                        isMini={this.props.isMini}
                        onPress={() => contextAction.onPress(this.props.reportAction)}
                        key={contextAction.text}
                    />
                ))}
            </View>
        );
    }
}

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    draftMessage: {
        key: ({reportID, reportAction}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}_${reportAction.reportActionID}`,
    },
})(ReportActionContextMenu);
