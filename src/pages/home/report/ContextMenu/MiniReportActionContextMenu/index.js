import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {
    Clipboard as ClipboardIcon, LinkCopy, Mail, Pencil, Trashcan, Checkmark,
} from '../../../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../../../styles/getReportActionContextMenuStyles';
import {
    setNewMarkerPosition, updateLastReadActionID, saveReportActionDraft,
} from '../../../../../libs/actions/Report';
import ContextMenuItem from '../../../../../components/ContextMenuItem';
import {propTypes, defaultProps} from './MiniReportActionContextMenuPropsTypes';
import Clipboard from '../../../../../libs/Clipboard';
import {isReportMessageAttachment, canEditReportAction, canDeleteReportAction} from '../../../../../libs/reportUtils';
import withLocalize from '../../../../../components/withLocalize';

class MiniReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.getActionText = this.getActionText.bind(this);

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
                shouldShow: () => canEditReportAction(this.props.reportAction),
                onPress: () => {
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
                shouldShow: () => canDeleteReportAction(this.props.reportAction),
                onPress: () => {
                    this.props.showDeleteConfirmModal(this.props.reportID, this.props.reportAction);
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

    render() {
        return this.props.isVisible && (
            <View style={getReportActionContextMenuStyles(true)}>
                {this.contextActions.map(contextAction => _.result(contextAction, 'shouldShow', false) && (
                    <ContextMenuItem
                        icon={contextAction.icon}
                        text={contextAction.text}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successText}
                        isMini
                        key={contextAction.text}
                        onPress={() => contextAction.onPress(this.props.reportAction)}
                    />
                ))}
            </View>
        );
    }
}

MiniReportActionContextMenu.propTypes = propTypes;
MiniReportActionContextMenu.defaultProps = defaultProps;

export default withLocalize(MiniReportActionContextMenu);
