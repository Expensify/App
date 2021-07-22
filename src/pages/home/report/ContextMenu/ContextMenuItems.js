import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../../components/Icon/Expensicons';
import {
    setNewMarkerPosition, updateLastReadActionID, saveReportActionDraft,
} from '../../../../libs/actions/Report';
import Clipboard from '../../../../libs/Clipboard';
import {isReportMessageAttachment, canEditReportAction, canDeleteReportAction} from '../../../../libs/reportUtils';
import ReportActionComposeFocusManager from '../../../../libs/ReportActionComposeFocusManager';

// A list of all the context actions in this menu.
const contextActions = [
    // Copy to clipboard
    {
        textTranslationKey: 'contextMenuItem.copyToClipboard',
        icon: ClipboardIcon,
        successTextTranslationKey: 'contextMenuItem.copied',
        successIcon: Checkmark,
        shouldShow: true,

        // If return value is true, we switch the `text` and `icon` on
        // `ContextMenuItem` with `successText` and `successIcon` which will fallback to
        // the `text` and `icon`
        onPress: (reportAction, selection, hidePopover) => {
            const message = _.last(lodashGet(reportAction, 'message', null));
            const html = lodashGet(message, 'html', '');
            const text = Str.htmlDecode(selection || lodashGet(message, 'text', ''));
            const isAttachment = _.has(reportAction, 'isAttachment')
                ? reportAction.isAttachment
                : isReportMessageAttachment(text);
            if (!isAttachment) {
                Clipboard.setString(text);
            } else {
                Clipboard.setString(html);
            }
            hidePopover(true, ReportActionComposeFocusManager.focus);
        },
    },

    {
        textTranslationKey: 'reportActionContextMenu.copyLink',
        icon: LinkCopy,
        shouldShow: false,
        onPress: () => {},
    },

    {
        textTranslationKey: 'reportActionContextMenu.markAsUnread',
        icon: Mail,
        successIcon: Checkmark,
        shouldShow: true,
        onPress: (reportID, reportAction) => {
            updateLastReadActionID(reportID, reportAction.sequenceNumber);
            setNewMarkerPosition(reportID, reportAction.sequenceNumber);
            this.hidePopover(true, ReportActionComposeFocusManager.focus);
        },
    },

    {
        textTranslationKey: 'reportActionContextMenu.editComment',
        icon: Pencil,
        shouldShow: reportAction => canEditReportAction(reportAction),
        onPress: (reportID, reportAction, draftMessage, isMini, hidePopover) => {
            const editAction = () => saveReportActionDraft(
                reportID,
                reportAction.reportActionID,
                _.isEmpty(draftMessage) ? this.getActionText() : '',
            );

            if (isMini) {
                // No popover to hide, call editAction immediately
                editAction();
            } else {
                // Hide popover, then call editAction
                hidePopover(false, editAction);
            }
        },
    },
    {
        textTranslationKey: 'reportActionContextMenu.deleteComment',
        icon: Trashcan,
        shouldShow: reportAction => canDeleteReportAction(reportAction),
        onPress: (isMini, showDeleteConfirmModal, hidePopover) => {
            if (isMini) {
                // No popover to hide, call showDeleteConfirmModal immediately
                showDeleteConfirmModal();
            } else {
                // Hide popover, then call showDeleteConfirmModal
                hidePopover(false, showDeleteConfirmModal);
            }
        },
    },
];

export default contextActions;
