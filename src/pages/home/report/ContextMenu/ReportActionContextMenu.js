import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import {
    setNewMarkerPosition, updateLastReadActionID, saveReportActionDraft,
} from '../../../../libs/actions/Report';
import ContextMenuItem from '../../../../components/ContextMenuItem';
import Clipboard from '../../../../libs/Clipboard';
import compose from '../../../../libs/compose';
import {
    propTypes as MiniReportActionContextMenuPropsTypes,
    defaultProps as MiniReportActionContextMenuDefaultProps,
} from './MiniReportActionContextMenu/MiniReportActionContextMenuPropsTypes';
import {isReportMessageAttachment, canEditReportAction, canDeleteReportAction} from '../../../../libs/reportUtils';
import withLocalize from '../../../../components/withLocalize';
import ReportActionComposeFocusManager from '../../../../libs/ReportActionComposeFocusManager';

const propTypes = {
    ...MiniReportActionContextMenuPropsTypes,

    /** Function to dismiss the popover containing this menu */
    hidePopover: PropTypes.func.isRequired,
};

const defaultProps = MiniReportActionContextMenuDefaultProps;

class ReportActionContextMenu extends React.PureComponent {
    constructor(props) {
        super(props);

        this.getActionText = this.getActionText.bind(this);
        this.hidePopover = this.hidePopover.bind(this);

        // A list of all the context actions in this menu.
        this.contextActions = [
            // Copy to clipboard
            {
                text: this.props.translate('contextMenuItem.copyToClipboard'),
                icon: ClipboardIcon,
                successText: this.props.translate('contextMenuItem.copied'),
                successIcon: Checkmark,
                shouldShow: true,

                // If return value is true, we switch the `text` and `icon` on
                // `ContextMenuItem` with `successText` and `successIcon` which will fallback to
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
                shouldShow: () => canDeleteReportAction(this.props.reportAction),
                onPress: () => {
                    if (this.props.isMini) {
                        // No popover to hide, call showDeleteConfirmModal immediately
                        this.props.showDeleteConfirmModal();
                    } else {
                        // Hide popover, then call showDeleteConfirmModal
                        this.hidePopover(false, this.props.showDeleteConfirmModal);
                    }
                },
            },
        ];
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
            <View style={getReportActionContextMenuStyles(false)}>
                {this.contextActions.map(contextAction => _.result(contextAction, 'shouldShow', false) && (
                    <ContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successText}
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
)(ReportActionContextMenu);
