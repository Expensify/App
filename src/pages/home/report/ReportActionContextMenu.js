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
import ReportActionPropTypes from './ReportActionPropTypes';
import Clipboard from '../../../libs/Clipboard';
import {isReportMessageAttachment} from '../../../libs/reportUtils';
import {deleteReportComment} from '../../../libs/actions/Report';
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

    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),
};

const defaultProps = {
    reportAction: {},
    isMini: false,
    isVisible: false,
    session: {},
};

// A list of all the context actions in this menu.
const contextActions = [
    {
        text: 'Copy to Clipboard',
        icon: ClipboardIcon,
        successText: 'Copied!',
        successIcon: Checkmark,
        shouldShow: () => true,
        onPress: (reportAction) => {
            const message = _.last(lodashGet(reportAction, 'message', null));
            const html = lodashGet(message, 'html', '');
            const text = lodashGet(message, 'text', '');
            const isAttachment = _.has(reportAction, 'isAttachment')
                ? reportAction.isAttachment
                : isReportMessageAttachment(text);
            if (!isAttachment) {
                Clipboard.setString(text);
            } else {
                Clipboard.setString(html);
            }
        },
    },

    {
        text: 'Copy Link',
        icon: LinkCopy,
        shouldShow: () => false,
        onPress: () => {},
    },

    {
        text: 'Mark as Unread',
        icon: Mail,
        shouldShow: () => false,
        onPress: () => {},
    },

    {
        text: 'Edit Comment',
        icon: Pencil,
        shouldShow: () => false,
        onPress: () => {},
    },

    {
        text: 'Delete Comment',
        icon: Trashcan,
        shouldShow: props => props.reportAction.actorEmail === props.session.email,
        onPress: (reportAction, reportID) => { deleteReportComment(reportID, reportAction); },
    },
];

class ReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);
    }

    render() {
        return this.props.isVisible && (
            <View style={this.wrapperStyle}>
                {contextActions.map(contextAction => contextAction.shouldShow(this.props) && (
                    <ReportActionContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successText}
                        isMini={this.props.isMini}
                        key={contextAction.text}
                        onPress={() => contextAction.onPress(this.props.reportAction, this.props.reportID)}
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
})(ReportActionContextMenu);
