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
import {setNewMarkerPosition, updateLastReadActionID, saveReportActionDraft} from '../../../libs/actions/Report';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import ReportActionPropTypes from './ReportActionPropTypes';
import Clipboard from '../../../libs/Clipboard';
import compose from '../../../libs/compose';
import {isReportMessageAttachment, canEditReportAction} from '../../../libs/reportUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    /** The report action this context menu is attached to. */
    reportAction: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** If true, this component will be a small, row-oriented menu that displays icons but not text.
    If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row. */
    isMini: PropTypes.bool,

    /** Controls the visibility of this component. */
    isVisible: PropTypes.bool,

    /** The copy selection of text. */
    selection: PropTypes.string,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /** Function to dismiss the popover containing this menu */
    hidePopover: PropTypes.func.isRequired,

    /* Onyx Props */

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Email of the logged in person */
        email: PropTypes.string,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    selection: '',
    session: {},
    draftMessage: '',
};

class ReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        // A list of all the context actions in this menu.
        this.CONTEXT_ACTIONS = [
            // Copy to clipboard
            {
                text: this.props.translate('reportActionContextMenu.copyToClipboard'),
                icon: ClipboardIcon,
                successText: this.props.translate('reportActionContextMenu.copied'),
                successIcon: Checkmark,
                shouldShow: true,

                // If return value is true, we switch the `text` and `icon` on
                // `ReportActionContextMenuItem` with `successText` and `successIcon` which will fallback to
                // the `text` and `icon`
                onPress: () => {
                    const message = _.last(lodashGet(this.props.reportAction, 'message', null));
                    const html = lodashGet(message, 'html', '');
                    const text = props.selection || lodashGet(message, 'text', '');
                    const isAttachment = _.has(this.props.reportAction, 'isAttachment')
                        ? this.props.reportAction.isAttachment
                        : isReportMessageAttachment(text);
                    if (!isAttachment) {
                        Clipboard.setString(text);
                    } else {
                        Clipboard.setString(html);
                    }
                },
            },

            {
                text: this.props.translate('reportActionContextMenu.copyLink'),
                icon: LinkCopy,
                shouldShow: false,
                onPress: () => {},
            },

            {
                text: this.props.translate('reportActionContextMenu.markAsUnread'),
                icon: Mail,
                successIcon: Checkmark,
                shouldShow: true,
                onPress: () => {
                    updateLastReadActionID(this.props.reportID, this.props.reportAction.sequenceNumber);
                    setNewMarkerPosition(this.props.reportID, this.props.reportAction.sequenceNumber);
                },
            },

            {
                text: this.props.translate('reportActionContextMenu.editComment'),
                icon: Pencil,
                shouldShow: canEditReportAction(this.props.reportAction),
                onPress: () => {
                    this.props.hidePopover();
                    saveReportActionDraft(
                        this.props.reportID,
                        this.props.reportAction.reportActionID,
                        _.isEmpty(this.props.draftMessage) ? this.getActionText() : '',
                    );
                },
            },

            {
                text: this.props.translate('reportActionContextMenu.deleteComment'),
                icon: Trashcan,
                shouldShow: false,
                onPress: () => {},
            },
        ];

        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);

        this.getActionText = this.getActionText.bind(this);
    }

    /**
     * Gets the text (not HTML) portion of the message in an action.
     *
     * @return {String}
     */
    getActionText() {
        const message = _.last(lodashGet(this.props.reportAction, 'message', null));
        return lodashGet(message, 'text', '');
    }

    render() {
        return this.props.isVisible && (
            <View style={this.wrapperStyle}>
                {this.CONTEXT_ACTIONS.map(contextAction => contextAction.shouldShow && (
                    <ReportActionContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successText}
                        isMini={this.props.isMini}
                        key={contextAction.text}
                        onPress={() => contextAction.onPress(this.props.reportAction)}
                    />
                ))}
            </View>
        );
    }
}

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportActionContextMenu);
