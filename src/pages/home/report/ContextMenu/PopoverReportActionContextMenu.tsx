import React, {ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions, EmitterSubscription} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useLocalize from '@hooks/useLocalize';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as IOU from '@userActions/IOU';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import {ReportAction} from '@src/types/onyx';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import {ContextMenuType} from './ReportActionContextMenu';

type PopoverReportActionContextMenuRef = {
    showContextMenu: () => void;
    hideContextMenu: () => void;
    showDeleteModal: () => void;
    hideDeleteModal: () => void;
    isActiveReportAction: () => void;
    instanceID: () => void;
    runAndResetOnPopoverHide: () => void;
    clearActiveReportAction: () => void;
    contentRef: () => void;
};

function PopoverReportActionContextMenu(_props: never, ref: ForwardedRef<PopoverReportActionContextMenuRef>) {
    const {translate} = useLocalize();
    const reportIDRef = useRef('0');
    const typeRef = useRef<ContextMenuType | undefined>(undefined);
    const reportActionRef = useRef<OnyxEntry<ReportAction>>(null);
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

    const [isRoomArchived, setIsRoomArchived] = useState(false);
    const [isChronosReportEnabled, setIsChronosReportEnabled] = useState(false);
    const [isChatPinned, setIsChatPinned] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const contentRef = useRef(null);
    const anchorRef = useRef(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef(null);
    const contextMenuTargetNode = useRef(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onCancelDeleteModal = useRef(() => {});
    const onComfirmDeleteModal = useRef(() => {});

    const onPopoverHideActionCallback = useRef(() => {});
    const callbackWhenDeleteModalHide = useRef(() => {});

    /**
     * Get the Context menu anchor position
     * We calculate the achor coordinates from measureInWindow async method
     *
     * @returns {Promise<Object>}
     */
    const getContextMenuMeasuredLocation = useCallback(
        () =>
            new Promise((resolve) => {
                if (contextMenuAnchorRef.current && _.isFunction(contextMenuAnchorRef.current.measureInWindow)) {
                    contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
                } else {
                    resolve({x: 0, y: 0});
                }
            }),
        [],
    );

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
                horizontal: cursorRelativePosition.current.horizontal + x,
                vertical: cursorRelativePosition.current.vertical + y,
            };
        });
    }, [isPopoverVisible, getContextMenuMeasuredLocation]);

    useEffect(() => {
        dimensionsEventListener.current = Dimensions.addEventListener('change', measureContextMenuAnchorPosition);

        return () => {
            if (!dimensionsEventListener.current) {
                return;
            }
            dimensionsEventListener.current.remove();
        };
    }, [measureContextMenuAnchorPosition]);

    /** Whether Context Menu is active for the Report Action. */
    const isActiveReportAction = (actionID: string): boolean => !!actionID && (reportActionIDRef.current === actionID || reportActionRef.current.reportActionID === actionID);

    const clearActiveReportAction = () => {
        reportActionIDRef.current = '0';
        reportActionRef.current = null;
    };

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param type - context menu type [EMAIL, LINK, REPORT_ACTION]
     * @param [event] - A press event.
     * @param [selection] - Copied content.
     * @param contextMenuAnchor - popoverAnchor
     * @param reportID - Active Report Id
     * @param reportActionID - ReportAction for ContextMenu
     * @param originalReportID - The currrent Report Id of the reportAction
     * @param draftMessage - ReportAction Draftmessage
     * @param [onShow] - Run a callback when Menu is shown
     * @param [onHide] - Run a callback when Menu is hidden
     * @param isArchivedRoom - Whether the provided report is an archived room
     * @param isChronosReport - Flag to check if the chat participant is Chronos
     * @param isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
     * @param isUnreadChat - Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action
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
        contextMenuAnchorRef.current = contextMenuAnchor;
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
            setIsRoomArchived(isArchivedRoom);
            setIsChronosReportEnabled(isChronosReport);
            setIsChatPinned(isPinnedChat);
            setHasUnreadMessages(isUnreadChat);
        });
    };

    /**
     * After Popover shows, call the registered onPopoverShow callback and reset it
     */
    const runAndResetOnPopoverShow = () => {
        onPopoverShow.current();

        // After we have called the action, reset it.
        onPopoverShow.current = () => {};
    };

    /**
     * Run the callback and return a noop function to reset it
     * @param callback
     * @returns
     */
    const runAndResetCallback = (callback) => {
        callback();
        return () => {};
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
     * @param onHideActionCallback Callback to be called after popover is completely hidden
     */
    const hideContextMenu = (onHideActionCallback) => {
        if (onHideActionCallback === 'function') {
            onPopoverHideActionCallback.current = onHideActionCallback;
        }

        selectionRef.current = '';
        reportActionDraftMessageRef.current = '';
        setIsPopoverVisible(false);
    };

    const confirmDeleteAndHideModal = useCallback(() => {
        callbackWhenDeleteModalHide.current = () => (onComfirmDeleteModal.current = runAndResetCallback(onComfirmDeleteModal.current));
        const reportAction = reportActionRef.current;
        if (ReportActionsUtils.isMoneyRequestAction(reportAction) && reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
            IOU.deleteMoneyRequest(reportAction?.originalMessage?.IOUTransactionID, reportAction);
        } else if (reportAction) {
            Report.deleteReportComment(reportIDRef.current, reportAction);
        }
        setIsDeleteCommentConfirmModalVisible(false);
    }, []);

    const hideDeleteModal = () => {
        callbackWhenDeleteModalHide.current = () => (onCancelDeleteModal.current = runAndResetCallback(onCancelDeleteModal.current));
        setIsDeleteCommentConfirmModalVisible(false);
        setShouldSetModalVisibilityForDeleteConfirmation(true);
        setIsRoomArchived(false);
        setIsChronosReportEnabled(false);
        setIsChatPinned(false);
        setHasUnreadMessages(false);
    };

    /**
     * Opens the Confirm delete action modal
     * @param reportID
     * @param reportAction
     * @param [shouldSetModalVisibility]
     * @param [onConfirm]
     * @param [onCancel]
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
        clearActiveReportAction,
        contentRef,
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
                    isArchivedRoom={isRoomArchived}
                    isChronosReport={isChronosReportEnabled}
                    isPinnedChat={isChatPinned}
                    isUnreadChat={hasUnreadMessages}
                    anchor={contextMenuTargetNode}
                    contentRef={contentRef}
                    originalReportID={originalReportIDRef.current}
                />
            </PopoverWithMeasuredContent>
            <ConfirmModal
                title={translate('reportActionContextMenu.deleteAction', {action: reportAction})}
                isVisible={isDeleteCommentConfirmModalVisible}
                shouldSetModalVisibility={shouldSetModalVisibilityForDeleteConfirmation}
                onConfirm={confirmDeleteAndHideModal}
                onCancel={hideDeleteModal}
                onModalHide={() => {
                    callbackWhenDeleteModalHide.current();
                }}
                prompt={translate('reportActionContextMenu.deleteConfirmation', {action: reportAction})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </>
    );
}

PopoverReportActionContextMenu.displayName = 'PopoverReportActionContextMenu';

export default forwardRef(PopoverReportActionContextMenu);
