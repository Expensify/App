import React, {forwardRef, useEffect, useState, useRef, useImperativeHandle, useCallback} from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';
import * as Report from '../../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import ConfirmModal from '../../../../components/ConfirmModal';
import * as ReportActionsUtils from '../../../../libs/ReportActionsUtils';
import * as IOU from '../../../../libs/actions/IOU';

const propTypes = {
    ...withLocalizePropTypes,
};

const PopoverReportActionContextMenu = forwardRef((props, ref) => {
    const reportIDRef = useRef('0');
    const typeRef = useRef('');
    const reportActionRef = useRef({});
    const reportActionIDRef = useRef('0');
    const originalReportIDRef = useRef('0');
    const selectionRef = useRef('');
    const reportActionDraftMessageRef = useRef('');

    const cursorRelativePosition = useRef({
        horizontal: 0,
        vertical: 0,
    });

    // The horizontal and vertical position (relative to the screen) where the popover will display.
    const popoverAnchorPosition = useRef({
        horizontal: 0,
        vertical: 0,
    });

    const [instanceID, setInstanceID] = useState('');

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isDeleteCommentConfirmModalVisible, setIsDeleteCommentConfirmModalVisible] = useState(false);
    const [shouldSetModalVisibilityForDeleteConfirmation, setShouldSetModalVisibilityForDeleteConfirmation] = useState(true);
    const [isArchivedRoom, setIsArchivedRoom] = useState(false);
    const [isChronosReport, setIsChronosReport] = useState(false);
    const [isPinnedChat, setIsPinnedChat] = useState(false);
    const [isUnreadChat, setIsUnreadChat] = useState(false);

    const contentRef = useRef(null);
    const anchorRef = useRef(null);
    const dimensionsEventListener = useRef(null);
    const contextMenuAnchor = useRef(null);
    const contextMenuTargetNode = useRef(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onCancelDeleteModal = useRef(() => {});
    const onComfirmDeleteModal = useRef(() => {});

    const onPopoverHideActionCallback = useRef(() => {});
    const callbackWhenDeleteModalHide = useRef(() => {});

    useEffect(() => {
        dimensionsEventListener.current = Dimensions.addEventListener('change', measureContextMenuAnchorPosition);

        return () => {
            if (dimensionsEventListener.current) {
                dimensionsEventListener.current.remove();
            }
        };
    }, []);

    /**
     * Get the Context menu anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    const getContextMenuMeasuredLocation = () => {
        return new Promise((resolve) => {
            if (contextMenuAnchor.current) {
                (contextMenuAnchor.current || contextMenuAnchor).measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });
    };

    /**
     * Whether Context Menu is active for the Report Action.
     *
     * @param {Number|String} actionID
     * @return {Boolean}
     */
    const isActiveReportAction = (actionID) => {
        return Boolean(actionID) && (reportActionIDRef.current === actionID || reportActionRef.current.reportActionID === actionID);
    };

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {string} type - context menu type [EMAIL, LINK, REPORT_ACTION]
     * @param {Object} [event] - A press event.
     * @param {String} [selection] - Copied content.
     * @param {Element} contextMenuAnchor - popoverAnchor
     * @param {String} reportID - Active Report Id
     * @param {Object} reportActionID - ReportAction for ContextMenu
     * @param {String} originalReportID - The currrent Report Id of the reportAction
     * @param {Function} [onShow] - Run a callback when Menu is shown
     * @param {Function} [onHide] - Run a callback when Menu is hidden
     * @param {Boolean} isArchivedRoom - Whether the provided report is an archived room
     * @param {Boolean} isChronosReport - Flag to check if the chat participant is Chronos
     * @param {Boolean} isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
     * @param {Boolean} isUnreadChat - Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action
     */
    const showContextMenu = (
        type,
        event,
        selection,
        contextMenuAnchor,
        reportID,
        reportActionID,
        originalReportID,
        draftMessage,
        onShow = () => {},
        onHide = () => {},
        isArchivedRoom = false,
        isChronosReport = false,
        isPinnedChat = false,
        isUnreadChat = false,
    ) => {
        const nativeEvent = event.nativeEvent || {};
        contextMenuAnchor.current = contextMenuAnchor;
        contextMenuTargetNode.current = nativeEvent.target;

        setInstanceID(Math.random().toString(36).substr(2, 5));

        onPopoverShow.current = onShow;
        onPopoverHide.current = onHide;

        getContextMenuMeasuredLocation().then(({x, y}) => {
            popoverAnchorPosition.current = {
                horizontal: nativeEvent.pageX - x,
                vertical: nativeEvent.pageY - y,
            };

            popoverAnchorPosition.current = {
                horizontal: nativeEvent.pageX,
                vertical: nativeEvent.pageY,
            };
            typeRef.current = type;
            reportIDRef.current = reportID;
            reportActionIDRef.current = reportActionID;
            originalReportIDRef.current = originalReportID;
            selectionRef.current = selection;
            setIsPopoverVisible(true);
            reportActionDraftMessageRef.current = draftMessage;
            setIsArchivedRoom(isArchivedRoom);
            setIsChronosReport(isChronosReport);
            setIsPinnedChat(isPinnedChat);
            setIsUnreadChat(isUnreadChat);
        });
    };

    /**
     * This gets called on Dimensions change to find the anchor coordinates for the action context menu.
     */
    const measureContextMenuAnchorPosition = useCallback(() => {
        if (!isPopoverVisible) {
            return;
        }

        getContextMenuMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }

            popoverAnchorPosition.current = {
                horizontal: cursorRelativePosition.horizontal + x,
                vertical: cursorRelativePosition.vertical + y,
            };
        });
    }, [isPopoverVisible, getContextMenuMeasuredLocation, cursorRelativePosition]);

    /**
     * After Popover shows, call the registered onPopoverShow callback and reset it
     */
    const runAndResetOnPopoverShow = () => {
        onPopoverShow.current();

        // After we have called the action, reset it.
        onPopoverShow.current = () => {};
    };

    /**
     * After Popover hides, call the registered onPopoverHide & onPopoverHideActionCallback callback and reset it
     */
    const runAndResetOnPopoverHide = () => {
        reportIDRef.current = '0';
        reportActionIDRef.current = '0';
        originalReportIDRef.current = '0';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param {Function} onHideActionCallback Callback to be called after popover is completely hidden
     */
    const hideContextMenu = (onHideActionCallback) => {
        if (_.isFunction(onHideActionCallback)) {
            onPopoverHideActionCallback.current = onHideActionCallback;
        }

        selectionRef.current = '';
        reportActionDraftMessageRef.current = '';
        setIsPopoverVisible(false);
    };

    /**
     * Run the callback and return a noop function to reset it
     * @param {Function} callback
     * @returns {Function}
     */
    const runAndResetCallback = (callback) => {
        callback();
        return () => {};
    };

    const confirmDeleteAndHideModal = useCallback(() => {
        callbackWhenDeleteModalHide.current = () => (onComfirmDeleteModal.current = runAndResetCallback(onComfirmDeleteModal.current));
        if (ReportActionsUtils.isMoneyRequestAction(reportAction)) {
            IOU.deleteMoneyRequest(reportActionRef.current.originalMessage.IOUTransactionID, reportActionRef.current);
        } else {
            Report.deleteReportComment(reportIDRef.current, reportActionRef.current);
        }
        setIsDeleteCommentConfirmModalVisible(false);
    }, [reportActionRef]);

    const hideDeleteModal = () => {
        callbackWhenDeleteModalHide.current = () => (onCancelDeleteModal.current = runAndResetCallback(onCancelDeleteModal.current));
        setIsDeleteCommentConfirmModalVisible(false);
        setShouldSetModalVisibilityForDeleteConfirmation(true);
        setIsArchivedRoom(false);
        setIsChronosReport(false);
        setIsPinnedChat(false);
        setIsUnreadChat(false);
    };

    /**
     * Opens the Confirm delete action modal
     * @param {String} reportID
     * @param {Object} reportAction
     * @param {Boolean} [shouldSetModalVisibility]
     * @param {Function} [onConfirm]
     * @param {Function} [onCancel]
     */
    const showDeleteModal = (reportID, reportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) => {
        onCancelDeleteModal.current = onCancel;
        onComfirmDeleteModal.current = onConfirm;

        reportIDRef.current = reportID;
        reportActionRef.current = reportAction;

        setShouldSetModalVisibilityForDeleteConfirmation(shouldSetModalVisibility);
        setIsDeleteCommentConfirmModalVisible(true);
    };

    useImperativeHandle(ref, () => ({
        showContextMenu,
        hideContextMenu,
        showDeleteModal,
        hideDeleteModal,
        isActiveReportAction,
        instanceID,
        runAndResetOnPopoverHide,
    }));

    const reportAction = reportActionRef.current;

    return (
        <>
            <PopoverWithMeasuredContent
                isVisible={isPopoverVisible}
                onClose={hideContextMenu}
                onModalShow={runAndResetOnPopoverShow}
                onModalHide={runAndResetOnPopoverHide}
                anchorPosition={popoverAnchorPosition.current}
                animationIn="fadeIn"
                disableAnimation={false}
                animationOutTiming={1}
                shouldSetModalVisibility={false}
                fullscreen
                withoutOverlay
                anchorRef={anchorRef}
            >
                <BaseReportActionContextMenu
                    isVisible
                    type={typeRef.current}
                    reportID={reportIDRef.current}
                    reportActionID={reportActionIDRef.current}
                    draftMessage={reportActionDraftMessageRef.current}
                    selection={selectionRef.current}
                    isArchivedRoom={isArchivedRoom}
                    isChronosReport={isChronosReport}
                    isPinnedChat={isPinnedChat}
                    isUnreadChat={isUnreadChat}
                    anchor={contextMenuTargetNode}
                    contentRef={contentRef}
                    originalReportID={originalReportIDRef.current}
                />
            </PopoverWithMeasuredContent>
            <ConfirmModal
                title={props.translate('reportActionContextMenu.deleteAction', {reportAction})}
                isVisible={isDeleteCommentConfirmModalVisible}
                shouldSetModalVisibility={shouldSetModalVisibilityForDeleteConfirmation}
                onConfirm={confirmDeleteAndHideModal}
                onCancel={hideDeleteModal}
                onModalHide={() => {
                    reportIDRef.current = '0';
                    reportActionRef.current = {};
                    callbackWhenDeleteModalHide.current();
                }}
                prompt={props.translate('reportActionContextMenu.deleteConfirmation', {action: reportAction})}
                confirmText={props.translate('common.delete')}
                cancelText={props.translate('common.cancel')}
                danger
            />
        </>
    );
});

PopoverReportActionContextMenu.propTypes = propTypes;
PopoverReportActionContextMenu.displayName = 'PopoverReportActionContextMenu';

export default withLocalize(PopoverReportActionContextMenu);
