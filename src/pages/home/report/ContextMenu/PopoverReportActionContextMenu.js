import React from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as Report from '../../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import ConfirmModal from '../../../../components/ConfirmModal';
import CONST from '../../../../CONST';
import * as ReportActionsUtils from '../../../../libs/ReportActionsUtils';
import * as IOU from '../../../../libs/actions/IOU';

const propTypes = {
    ...withLocalizePropTypes,
};

class PopoverReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reportID: '0',
            reportAction: {},
            selection: '',
            reportActionDraftMessage: '',
            isPopoverVisible: false,
            isDeleteCommentConfirmModalVisible: false,
            shouldSetModalVisibilityForDeleteConfirmation: true,
            cursorRelativePosition: {
                horizontal: 0,
                vertical: 0,
            },

            // The horizontal and vertical position (relative to the screen) where the popover will display.
            popoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
            isArchivedRoom: false,
            isChronosReport: false,
            isPinnedChat: false,
            isUnreadChat: false,
        };
        this.onPopoverShow = () => {};
        this.onPopoverHide = () => {};
        this.onPopoverHideActionCallback = () => {};
        this.contextMenuAnchor = undefined;
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.measureContextMenuAnchorPosition = this.measureContextMenuAnchorPosition.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hideDeleteModal = this.hideDeleteModal.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.runAndResetOnPopoverShow = this.runAndResetOnPopoverShow.bind(this);
        this.runAndResetOnPopoverHide = this.runAndResetOnPopoverHide.bind(this);
        this.getContextMenuMeasuredLocation = this.getContextMenuMeasuredLocation.bind(this);
        this.isActiveReportAction = this.isActiveReportAction.bind(this);

        this.dimensionsEventListener = null;

        this.contentRef = React.createRef();
        this.setContentRef = (ref) => {
            this.contentRef.current = ref;
        };
        this.setContentRef = this.setContentRef.bind(this);
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureContextMenuAnchorPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const previousLocale = lodashGet(this.props, 'preferredLocale', CONST.LOCALES.DEFAULT);
        const nextLocale = lodashGet(nextProps, 'preferredLocale', CONST.LOCALES.DEFAULT);
        return (
            this.state.isPopoverVisible !== nextState.isPopoverVisible ||
            this.state.popoverAnchorPosition !== nextState.popoverAnchorPosition ||
            this.state.isDeleteCommentConfirmModalVisible !== nextState.isDeleteCommentConfirmModalVisible ||
            previousLocale !== nextLocale
        );
    }

    componentWillUnmount() {
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
    }

    /**
     * Get the Context menu anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    getContextMenuMeasuredLocation() {
        return new Promise((resolve) => {
            if (this.contextMenuAnchor) {
                (this.contextMenuAnchor.current || this.contextMenuAnchor).measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });
    }

    /**
     * Whether Context Menu is active for the Report Action.
     *
     * @param {Number|String} actionID
     * @return {Boolean}
     */
    isActiveReportAction(actionID) {
        return Boolean(actionID) && this.state.reportAction.reportActionID === actionID;
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {string} type - context menu type [EMAIL, LINK, REPORT_ACTION]
     * @param {Object} [event] - A press event.
     * @param {String} [selection] - Copied content.
     * @param {Element} contextMenuAnchor - popoverAnchor
     * @param {String} reportID - Active Report Id
     * @param {Object} reportAction - ReportAction for ContextMenu
     * @param {String} draftMessage - ReportAction Draftmessage
     * @param {Function} [onShow] - Run a callback when Menu is shown
     * @param {Function} [onHide] - Run a callback when Menu is hidden
     * @param {Boolean} isArchivedRoom - Whether the provided report is an archived room
     * @param {Boolean} isChronosReport - Flag to check if the chat participant is Chronos
     * @param {Boolean} isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
     * @param {Boolean} isUnreadChat - Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action
     */
    showContextMenu(
        type,
        event,
        selection,
        contextMenuAnchor,
        reportID,
        reportAction,
        draftMessage,
        onShow = () => {},
        onHide = () => {},
        isArchivedRoom = false,
        isChronosReport = false,
        isPinnedChat = false,
        isUnreadChat = false,
    ) {
        const nativeEvent = event.nativeEvent || {};
        this.contextMenuAnchor = contextMenuAnchor;
        this.contextMenuTargetNode = nativeEvent.target;

        // Singleton behaviour of ContextMenu creates race conditions when user requests multiple contextMenus.
        // But it is possible that every new request registers new callbacks thus instanceID is used to corelate those callbacks
        this.instanceID = Math.random().toString(36).substr(2, 5);

        this.onPopoverShow = onShow;
        this.onPopoverHide = onHide;

        this.getContextMenuMeasuredLocation().then(({x, y}) => {
            this.setState({
                cursorRelativePosition: {
                    horizontal: nativeEvent.pageX - x,
                    vertical: nativeEvent.pageY - y,
                },
                popoverAnchorPosition: {
                    horizontal: nativeEvent.pageX,
                    vertical: nativeEvent.pageY,
                },
                type,
                reportID,
                reportAction,
                selection,
                isPopoverVisible: true,
                reportActionDraftMessage: draftMessage,
                isArchivedRoom,
                isChronosReport,
                isPinnedChat,
                isUnreadChat,
            });
        });
    }

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action context menu.
     */
    measureContextMenuAnchorPosition() {
        if (!this.state.isPopoverVisible) {
            return;
        }
        this.getContextMenuMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }
            this.setState((prev) => ({
                popoverAnchorPosition: {
                    horizontal: prev.cursorRelativePosition.horizontal + x,
                    vertical: prev.cursorRelativePosition.vertical + y,
                },
            }));
        });
    }

    /**
     * After Popover shows, call the registered onPopoverShow callback and reset it
     */
    runAndResetOnPopoverShow() {
        this.onPopoverShow();

        // After we have called the action, reset it.
        this.onPopoverShow = () => {};
    }

    /**
     * After Popover hides, call the registered onPopoverHide & onPopoverHideActionCallback callback and reset it
     */
    runAndResetOnPopoverHide() {
        this.setState({reportID: '0', reportAction: {}}, () => {
            this.onPopoverHide = this.runAndResetCallback(this.onPopoverHide);
            this.onPopoverHideActionCallback = this.runAndResetCallback(this.onPopoverHideActionCallback);
        });
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param {Function} onHideActionCallback Callback to be called after popover is completely hidden
     */
    hideContextMenu(onHideActionCallback) {
        if (_.isFunction(onHideActionCallback)) {
            this.onPopoverHideActionCallback = onHideActionCallback;
        }
        this.setState({
            selection: '',
            reportActionDraftMessage: '',
            isPopoverVisible: false,
        });
    }

    /**
     * Run the callback and return a noop function to reset it
     * @param {Function} callback
     * @returns {Function}
     */
    runAndResetCallback(callback) {
        callback();
        return () => {};
    }

    confirmDeleteAndHideModal() {
        this.callbackWhenDeleteModalHide = () => (this.onComfirmDeleteModal = this.runAndResetCallback(this.onComfirmDeleteModal));

        if (ReportActionsUtils.isMoneyRequestAction(this.state.reportAction)) {
            IOU.deleteMoneyRequest(this.state.reportAction.originalMessage.IOUTransactionID, this.state.reportAction);
        } else {
            Report.deleteReportComment(this.state.reportID, this.state.reportAction);
        }
        this.setState({isDeleteCommentConfirmModalVisible: false});
    }

    hideDeleteModal() {
        this.callbackWhenDeleteModalHide = () => (this.onCancelDeleteModal = this.runAndResetCallback(this.onCancelDeleteModal));
        this.setState({
            isDeleteCommentConfirmModalVisible: false,
            shouldSetModalVisibilityForDeleteConfirmation: true,
            isArchivedRoom: false,
            isChronosReport: false,
            isPinnedChat: false,
            isUnreadChat: false,
        });
    }

    /**
     * Opens the Confirm delete action modal
     * @param {String} reportID
     * @param {Object} reportAction
     * @param {Boolean} [shouldSetModalVisibility]
     * @param {Function} [onConfirm]
     * @param {Function} [onCancel]
     */
    showDeleteModal(reportID, reportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) {
        this.onCancelDeleteModal = onCancel;
        this.onComfirmDeleteModal = onConfirm;
        this.setState({
            reportID,
            reportAction,
            shouldSetModalVisibilityForDeleteConfirmation: shouldSetModalVisibility,
            isDeleteCommentConfirmModalVisible: true,
        });
    }

    render() {
        return (
            <>
                <PopoverWithMeasuredContent
                    isVisible={this.state.isPopoverVisible}
                    onClose={this.hideContextMenu}
                    onModalShow={this.runAndResetOnPopoverShow}
                    onModalHide={this.runAndResetOnPopoverHide}
                    anchorPosition={this.state.popoverAnchorPosition}
                    animationIn="fadeIn"
                    disableAnimation={false}
                    animationOutTiming={1}
                    shouldSetModalVisibility={false}
                    fullscreen
                >
                    <BaseReportActionContextMenu
                        isVisible
                        type={this.state.type}
                        reportID={this.state.reportID}
                        reportAction={this.state.reportAction}
                        draftMessage={this.state.reportActionDraftMessage}
                        selection={this.state.selection}
                        isArchivedRoom={this.state.isArchivedRoom}
                        isChronosReport={this.state.isChronosReport}
                        isPinnedChat={this.state.isPinnedChat}
                        isUnreadChat={this.state.isUnreadChat}
                        anchor={this.contextMenuTargetNode}
                        contentRef={this.contentRef}
                    />
                </PopoverWithMeasuredContent>
                <ConfirmModal
                    title={this.props.translate('reportActionContextMenu.deleteAction', {action: this.state.reportAction})}
                    isVisible={this.state.isDeleteCommentConfirmModalVisible}
                    shouldSetModalVisibility={this.state.shouldSetModalVisibilityForDeleteConfirmation}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={this.hideDeleteModal}
                    onModalHide={() => {
                        this.setState({reportID: '0', reportAction: {}});
                        this.callbackWhenDeleteModalHide();
                    }}
                    prompt={this.props.translate('reportActionContextMenu.deleteConfirmation', {action: this.state.reportAction})}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                    danger
                />
            </>
        );
    }
}

PopoverReportActionContextMenu.propTypes = propTypes;

export default withLocalize(PopoverReportActionContextMenu);
