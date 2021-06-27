import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import {
    setNewMarkerPosition, updateLastReadActionID, saveReportActionDraft, deleteReportComment,
} from '../../../libs/actions/Report';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import ReportActionPropTypes from './ReportActionPropTypes';
import Clipboard from '../../../libs/Clipboard';
import compose from '../../../libs/compose';
import {isReportMessageAttachment, canEditReportAction} from '../../../libs/reportUtils';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ConfirmModal from '../../../components/ConfirmModal';
import ReportActionComposeFocusManager from '../../../libs/ReportActionComposeFocusManager';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    selection: '',
    draftMessage: '',
};

class ReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hideDeleteConfirmModal = this.hideDeleteConfirmModal.bind(this);
        this.getActionText = this.getActionText.bind(this);
        this.hidePopover = this.hidePopover.bind(this);

        // A list of all the context actions in this menu.
        this.contextActions = [
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
                    const text = Str.htmlDecode(props.selection || lodashGet(message, 'text', ''));
                    const isAttachment = _.has(this.props.reportAction, 'isAttachment')
                        ? this.props.reportAction.isAttachment
                        : isReportMessageAttachment(text);
                    if (!isAttachment) {
                        Clipboard.setString(text);
                    } else {
                        Clipboard.setString(html);
                    }
                    this.hidePopover(true, ReportActionComposeFocusManager.focus);
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
                    this.hidePopover(true, ReportActionComposeFocusManager.focus);
                },
            },

            {
                text: this.props.translate('reportActionContextMenu.editComment'),
                icon: Pencil,
                shouldShow: () => canEditReportAction(this.props.reportAction),
                onPress: () => {
                    const editAction = () => saveReportActionDraft(
                        this.props.reportID,
                        this.props.reportAction.reportActionID,
                        _.isEmpty(this.props.draftMessage) ? this.getActionText() : '',
                    );

                    if (this.props.isMini) {
                        // No popover to hide, call editAction immediately
                        editAction();
                    } else {
                        // Hide popover, then call editAction
                        this.hidePopover(false, editAction);
                    }
                },
            },
            {
                text: this.props.translate('reportActionContextMenu.deleteComment'),
                icon: Trashcan,
                shouldShow: () => canEditReportAction(this.props.reportAction),
                onPress: () => this.setState({isDeleteCommentConfirmModalVisible: true}),
            },
        ];

        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);

        this.state = {
            isDeleteCommentConfirmModalVisible: false,
        };
    }

    /**
     * Gets the markdown version of the message in an action.
     *
     * @return {String}
     */
    getActionText() {
        const message = _.last(lodashGet(this.props.reportAction, 'message', null));
        return lodashGet(message, 'html', '');
    }

    confirmDeleteAndHideModal() {
        deleteReportComment(this.props.reportID, this.props.reportAction);
        this.setState({isDeleteCommentConfirmModalVisible: false});
        this.hidePopover();
    }

    hideDeleteConfirmModal() {
        this.setState({isDeleteCommentConfirmModalVisible: false});
        this.hidePopover();
    }

    /**
     * Hides the popover menu with an optional delay
     *
     * @param {Boolean} shouldDelay whether the menu should close after a delay
     * @param {Function} [onHideCallback=() => {}] Callback to be called after Popover Menu is hidden
     * @memberof ReportActionContextMenu
     */
    hidePopover(shouldDelay, onHideCallback = () => {}) {
        if (!shouldDelay) {
            this.props.hidePopover(onHideCallback);
            return;
        }
        setTimeout(() => this.props.hidePopover(onHideCallback), 800);
    }

    render() {
        return this.props.isVisible && (
            <View style={this.wrapperStyle}>
                {this.contextActions.map(contextAction => _.result(contextAction, 'shouldShow', false) && (
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
                <ConfirmModal
                    title={this.props.translate('reportActionContextMenu.deleteComment')}
                    isVisible={this.state.isDeleteCommentConfirmModalVisible}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={this.hideDeleteConfirmModal}
                    prompt={this.props.translate('reportActionContextMenu.deleteConfirmation')}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                />
            </View>
        );
    }
}

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default compose(
    withLocalize,
)(ReportActionContextMenu);
