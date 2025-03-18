/* eslint-disable react-compiler/react-compiler */
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';

/* eslint-disable no-restricted-imports */
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, View} from 'react-native';
import {DeviceEventEmitter, Dimensions} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useLocalize from '@hooks/useLocalize';
import {deleteMoneyRequest, deleteTrackExpense} from '@libs/actions/IOU';
import {deleteReportComment} from '@libs/actions/Report';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import {getOriginalMessage, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {AnchorDimensions} from '@src/styles';
import type {ReportAction} from '@src/types/onyx';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import type {ContextMenuAction} from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';

type Location = {
    x: number;
    y: number;
};

function extractPointerEvent(event: GestureResponderEvent | MouseEvent): MouseEvent | NativeTouchEvent {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}

function PopoverReportActionContextMenu(_props: unknown, ref: ForwardedRef<ReportActionContextMenu>) {
    const {translate} = useLocalize();
    const reportIDRef = useRef<string | undefined>();
    const typeRef = useRef<ContextMenuType>();
    const reportActionRef = useRef<NonNullable<OnyxEntry<ReportAction>> | null>(null);
    const reportActionIDRef = useRef<string | undefined>();
    const originalReportIDRef = useRef<string | undefined>();
    const selectionRef = useRef('');
    const reportActionDraftMessageRef = useRef<string>();

    const cursorRelativePosition = useRef({
        horizontal: 0,
        vertical: 0,
    });

    // The horizontal and vertical position (relative to the screen) where the popover will display.
    const popoverAnchorPosition = useRef({
        horizontal: 0,
        vertical: 0,
    });

    const instanceIDRef = useRef('');

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isDeleteCommentConfirmModalVisible, setIsDeleteCommentConfirmModalVisible] = useState(false);
    const [shouldSetModalVisibilityForDeleteConfirmation, setShouldSetModalVisibilityForDeleteConfirmation] = useState(true);

    const [isRoomArchived, setIsRoomArchived] = useState(false);
    const [isChronosReportEnabled, setIsChronosReportEnabled] = useState(false);
    const [isChatPinned, setIsChatPinned] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isThreadReportParentAction, setIsThreadReportParentAction] = useState(false);
    const [disabledActions, setDisabledActions] = useState<ContextMenuAction[]>([]);
    const [shoudSwitchPositionIfOverflow, setShoudSwitchPositionIfOverflow] = useState(false);

    const contentRef = useRef<View>(null);
    const anchorRef = useRef<View | HTMLDivElement | null>(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);
    const contextMenuTargetNode = useRef<HTMLDivElement | null>(null);
    const contextMenuDimensions = useRef<AnchorDimensions>({
        width: 0,
        height: 0,
    });

    const onPopoverShow = useRef(() => {});
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const onPopoverHide = useRef(() => {});
    const onEmojiPickerToggle = useRef<undefined | ((state: boolean) => void)>();
    const onCancelDeleteModal = useRef(() => {});
    const onConfirmDeleteModal = useRef(() => {});

    const onPopoverHideActionCallback = useRef(() => {});
    const callbackWhenDeleteModalHide = useRef(() => {});

    /** Get the Context menu anchor position. We calculate the anchor coordinates from measureInWindow async method */
    const getContextMenuMeasuredLocation = useCallback(
        () =>
            new Promise<Location>((resolve) => {
                if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                    contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
                } else {
                    resolve({x: 0, y: 0});
                }
            }),
        [],
    );

    /** This gets called on Dimensions change to find the anchor coordinates for the action context menu. */
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
    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) =>
        !!actionID && (reportActionIDRef.current === actionID || reportActionRef.current?.reportActionID === actionID);

    const clearActiveReportAction = () => {
        reportActionIDRef.current = undefined;
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
    const showContextMenu: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report = {},
            reportAction = {},
            callbacks = {},
            disabledOptions = [],
            shouldCloseOnTarget = false,
            isOverflowMenu = false,
        } = showContextMenuParams;
        const {reportID, originalReportID, isArchivedRoom = false, isChronos = false, isPinnedChat = false, isUnreadChat = false} = report;
        const {reportActionID, draftMessage, isThreadReportParentAction: isThreadReportParentActionParam = false} = reportAction;
        const {onShow = () => {}, onHide = () => {}, setIsEmojiPickerActive = () => {}} = callbacks;
        setIsContextMenuOpening(true);
        const {pageX = 0, pageY = 0} = extractPointerEvent(event);
        contextMenuAnchorRef.current = contextMenuAnchor;
        contextMenuTargetNode.current = event.target as HTMLDivElement;
        if (shouldCloseOnTarget) {
            anchorRef.current = event.target as HTMLDivElement;
        } else {
            anchorRef.current = null;
        }

        onPopoverShow.current = onShow;
        onPopoverHide.current = onHide;
        onEmojiPickerToggle.current = setIsEmojiPickerActive;

        new Promise<void>((resolve) => {
            if (!!(!pageX && !pageY && contextMenuAnchorRef.current) || isOverflowMenu) {
                calculateAnchorPosition(contextMenuAnchorRef.current).then((position) => {
                    popoverAnchorPosition.current = {horizontal: position.horizontal, vertical: position.vertical};
                    contextMenuDimensions.current = {width: position.vertical, height: position.height};
                    resolve();
                });
            } else {
                getContextMenuMeasuredLocation().then(({x, y}) => {
                    cursorRelativePosition.current = {
                        horizontal: pageX - x,
                        vertical: pageY - y,
                    };
                    popoverAnchorPosition.current = {
                        horizontal: pageX,
                        vertical: pageY,
                    };
                    resolve();
                });
            }
        }).then(() => {
            setDisabledActions(disabledOptions);
            typeRef.current = type;
            reportIDRef.current = reportID;
            reportActionIDRef.current = reportActionID;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            originalReportIDRef.current = originalReportID || undefined;
            selectionRef.current = selection;
            setIsPopoverVisible(true);
            reportActionDraftMessageRef.current = draftMessage;
            setIsRoomArchived(isArchivedRoom);
            setIsChronosReportEnabled(isChronos);
            setIsChatPinned(isPinnedChat);
            setHasUnreadMessages(isUnreadChat);
            setIsThreadReportParentAction(isThreadReportParentActionParam);
            setShoudSwitchPositionIfOverflow(isOverflowMenu);
        });
    };

    /** After Popover shows, call the registered onPopoverShow callback and reset it */
    const runAndResetOnPopoverShow = () => {
        instanceIDRef.current = Math.random().toString(36).slice(2, 7);
        onPopoverShow.current();

        // After we have called the action, reset it.
        onPopoverShow.current = () => {};

        // After the context menu opening animation ends reset isContextMenuOpening.
        setTimeout(() => {
            setIsContextMenuOpening(false);
        }, CONST.ANIMATED_TRANSITION);
    };

    /** Run the callback and return a noop function to reset it */
    const runAndResetCallback = (callback: () => void) => {
        callback();
        return () => {};
    };

    /** After Popover hides, call the registered onPopoverHide & onPopoverHideActionCallback callback and reset it */
    const runAndResetOnPopoverHide = () => {
        reportIDRef.current = undefined;
        reportActionIDRef.current = undefined;
        originalReportIDRef.current = undefined;
        instanceIDRef.current = '';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param onHideActionCallback Callback to be called after popover is completely hidden
     */
    const hideContextMenu: ReportActionContextMenu['hideContextMenu'] = (onHideActionCallback) => {
        if (typeof onHideActionCallback === 'function') {
            onPopoverHideActionCallback.current = onHideActionCallback;
        }

        selectionRef.current = '';
        reportActionDraftMessageRef.current = undefined;
        setIsPopoverVisible(false);
    };

    const confirmDeleteAndHideModal = useCallback(() => {
        callbackWhenDeleteModalHide.current = runAndResetCallback(onConfirmDeleteModal.current);
        const reportAction = reportActionRef.current;
        if (isMoneyRequestAction(reportAction)) {
            const originalMessage = getOriginalMessage(reportAction);
            if (isTrackExpenseAction(reportAction)) {
                deleteTrackExpense(reportIDRef.current, originalMessage?.IOUTransactionID, reportAction);
            } else {
                deleteMoneyRequest(originalMessage?.IOUTransactionID, reportAction);
            }
        } else if (reportAction) {
            deleteReportComment(reportIDRef.current, reportAction);
        }

        DeviceEventEmitter.emit(`deletedReportAction_${reportIDRef.current}`, reportAction?.reportActionID);
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

    /** Opens the Confirm delete action modal */
    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = (reportID, reportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) => {
        onCancelDeleteModal.current = onCancel;

        onConfirmDeleteModal.current = onConfirm;
        reportIDRef.current = reportID;
        reportActionRef.current = reportAction ?? null;

        setShouldSetModalVisibilityForDeleteConfirmation(shouldSetModalVisibility);
        setIsDeleteCommentConfirmModalVisible(true);
    };

    useImperativeHandle(ref, () => ({
        showContextMenu,
        hideContextMenu,
        showDeleteModal,
        hideDeleteModal,
        isActiveReportAction,
        instanceIDRef,
        runAndResetOnPopoverHide,
        clearActiveReportAction,
        contentRef,
        isContextMenuOpening,
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
                anchorDimensions={contextMenuDimensions.current}
                anchorRef={anchorRef}
                shoudSwitchPositionIfOverflow={shoudSwitchPositionIfOverflow}
            >
                <BaseReportActionContextMenu
                    isVisible={isPopoverVisible}
                    type={typeRef.current}
                    reportID={reportIDRef.current}
                    reportActionID={reportActionIDRef.current}
                    draftMessage={reportActionDraftMessageRef.current}
                    selection={selectionRef.current}
                    isArchivedRoom={isRoomArchived}
                    isChronosReport={isChronosReportEnabled}
                    isPinnedChat={isChatPinned}
                    isUnreadChat={hasUnreadMessages}
                    isThreadReportParentAction={isThreadReportParentAction}
                    anchor={contextMenuTargetNode}
                    contentRef={contentRef}
                    originalReportID={originalReportIDRef.current}
                    disabledActions={disabledActions}
                    setIsEmojiPickerActive={onEmojiPickerToggle.current}
                />
            </PopoverWithMeasuredContent>
            <ConfirmModal
                title={translate('reportActionContextMenu.deleteAction', {action: reportAction})}
                isVisible={isDeleteCommentConfirmModalVisible}
                shouldSetModalVisibility={shouldSetModalVisibilityForDeleteConfirmation}
                onConfirm={confirmDeleteAndHideModal}
                onCancel={hideDeleteModal}
                onModalHide={() => {
                    clearActiveReportAction();
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
