import {Actions, useActionSheetAwareScrollViewActions} from '@components/ActionSheetAwareScrollView';
import ConfirmModal from '@components/ConfirmModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import useLocalize from '@hooks/useLocalize';

import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';

import CONST from '@src/CONST';
import type {AnchorDimensions} from '@src/styles';
import type {ReportAction} from '@src/types/onyx';
import type {Location} from '@src/types/utils/Layout';

import type {ComponentRef, ForwardedRef} from 'react';
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions} from 'react-native';
import {cancelAnimation, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type {ContextMenuAction} from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';
import type {UseDeleteReportActionParams} from './useDeleteReportAction';

import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import useDeleteReportAction from './useDeleteReportAction';

type DeleteReportActionConfirmModalProps = UseDeleteReportActionParams & {
    isVisible: boolean;

    shouldSetModalVisibility: boolean;

    onCancel: () => void;

    onModalHide: () => void;
};

function DeleteReportActionConfirmModal({
    reportID,
    reportAction,
    isVisible,
    shouldSetModalVisibility,
    onConfirm,
    onClose,
    onCancel,
    onModalHide,
    deleteAfterModalHide,
}: DeleteReportActionConfirmModalProps) {
    const {translate} = useLocalize();
    const confirmDelete = useDeleteReportAction({reportID, reportAction, onConfirm, onClose, deleteAfterModalHide});

    return (
        <ConfirmModal
            title={translate('reportActionContextMenu.deleteAction', reportAction)}
            isVisible={isVisible}
            shouldSetModalVisibility={shouldSetModalVisibility}
            onConfirm={confirmDelete}
            onCancel={onCancel}
            onModalHide={onModalHide}
            prompt={translate('reportActionContextMenu.deleteConfirmation', reportAction)}
            confirmText={translate('common.delete')}
            cancelText={translate('common.cancel')}
            buttonVariant={CONST.BUTTON_VARIANT.DANGER}
        />
    );
}

function extractPointerEvent(event: GestureResponderEvent | MouseEvent): MouseEvent | NativeTouchEvent {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}

type PopoverReportActionContextMenuProps = {
    ref?: ForwardedRef<ReportActionContextMenu>;
};

function PopoverReportActionContextMenu({ref}: PopoverReportActionContextMenuProps) {
    const reportIDRef = useRef<string | undefined>(undefined);
    const typeRef = useRef<ContextMenuType | undefined>(undefined);
    const reportActionRef = useRef<NonNullable<OnyxEntry<ReportAction>> | null>(null);
    const reportActionIDRef = useRef<string | undefined>(undefined);
    const originalReportIDRef = useRef<string | undefined>(undefined);
    const selectionRef = useRef('');
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();

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
    // UI-thread timer driving the delayed hide. https://github.com/Expensify/App/issues/89069
    const hideDelayProgress = useSharedValue(0);
    const [isDeleteCommentConfirmModalVisible, setIsDeleteCommentConfirmModalVisible] = useState(false);
    // On Android onModalHide fires from the exit-animation snapshot and closes over that render's visibility
    const isDeleteCommentConfirmModalVisibleRef = useRef(false);
    const [shouldSetModalVisibilityForDeleteConfirmation, setShouldSetModalVisibilityForDeleteConfirmation] = useState(true);
    const [deleteModalTarget, setDeleteModalTarget] = useState<{reportID: string; reportAction: ReportAction | null} | null>(null);

    const [isThreadReportParentAction, setIsThreadReportParentAction] = useState(false);
    const [disabledActions, setDisabledActions] = useState<ContextMenuAction[]>([]);
    const [shouldSwitchPositionIfOverflow, setShouldSwitchPositionIfOverflow] = useState(false);
    const [isWithoutOverlay, setIsWithoutOverlay] = useState<boolean>(true);

    const contentRef = useRef<ComponentRef<typeof View>>(null);
    const anchorRef = useRef<ComponentRef<typeof View> | HTMLDivElement | null>(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);
    const contextMenuTargetNode = useRef<HTMLDivElement | null>(null);
    const contextMenuDimensions = useRef<AnchorDimensions>({
        width: 0,
        height: 0,
    });

    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();

    const onPopoverShow = useRef(() => {});
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const onPopoverHide = useRef(() => {});
    const onEmojiPickerToggle = useRef<undefined | ((state: boolean) => void)>(undefined);
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
     * @param originalReportID - The current Report Id of the reportAction
     * @param [onShow] - Run a callback when Menu is shown
     * @param [onHide] - Run a callback when Menu is hidden
     */
    const showContextMenu: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        cancelAnimation(hideDelayProgress);
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction = {},
            callbacks = {},
            disabledOptions = [],
            shouldCloseOnTarget = false,
            isOverflowMenu = false,
            withoutOverlay = true,
        } = showContextMenuParams;
        if (ReportActionComposeFocusManager.isFocused()) {
            setComposerToRefocusOnClose('main');
        } else if (ReportActionComposeFocusManager.isEditFocused()) {
            setComposerToRefocusOnClose('edit');
        }

        const {reportID, originalReportID} = currentReport;
        const {reportActionID, isThreadReportParentAction: isThreadReportParentActionParam = false} = reportAction;
        const {onShow = () => {}, onHide = () => {}, setIsEmojiPickerActive = () => {}} = callbacks;
        setIsContextMenuOpening(true);
        setIsWithoutOverlay(withoutOverlay);
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
            originalReportIDRef.current = originalReportID || undefined;
            selectionRef.current = selection;
            setIsPopoverVisible(true);
            setIsThreadReportParentAction(isThreadReportParentActionParam);
            setShouldSwitchPositionIfOverflow(isOverflowMenu);
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
        selectionRef.current = '';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param onHideActionCallback Callback to be called after popover is completely hidden
     */
    const performHide = () => {
        selectionRef.current = '';
        setIsPopoverVisible(false);

        transitionActionSheetState({
            type: Actions.CLOSE_POPOVER,
        });

        refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose).then(() => {
            setComposerToRefocusOnClose(undefined);
        });
    };

    const hideContextMenu: ReportActionContextMenu['hideContextMenu'] = (hideContextMenuParams) => {
        const {callbacks = {}, hideDelayMs} = hideContextMenuParams ?? {};

        if (typeof callbacks.onHide === 'function') {
            onPopoverHideActionCallback.current = callbacks.onHide;
        }

        cancelAnimation(hideDelayProgress);

        if (!hideDelayMs || hideDelayMs <= 0) {
            performHide();
            return;
        }

        // UI-thread delayed hide. https://github.com/Expensify/App/issues/89069
        hideDelayProgress.set(0);
        hideDelayProgress.set(
            withTiming(1, {duration: hideDelayMs}, (finished) => {
                'worklet';

                if (finished) {
                    scheduleOnRN(performHide);
                }
            }),
        );
    };

    const runConfirmDeleteCallback = () => {
        callbackWhenDeleteModalHide.current = runAndResetCallback(onConfirmDeleteModal.current);
    };

    const closeDeleteModal = () => {
        isDeleteCommentConfirmModalVisibleRef.current = false;
        setIsDeleteCommentConfirmModalVisible(false);
    };

    const deleteCommentAfterModalHide = (deleteComment: () => void) => {
        callbackWhenDeleteModalHide.current = deleteComment;
    };

    const finishDeleteModalHide = () => {
        clearActiveReportAction();
        callbackWhenDeleteModalHide.current();
        // A new delete was requested while the previous confirmation was still hiding, so keep it mounted
        if (isDeleteCommentConfirmModalVisibleRef.current) {
            return;
        }
        setDeleteModalTarget(null);
    };

    const hideDeleteModal = () => {
        callbackWhenDeleteModalHide.current = () => (onCancelDeleteModal.current = runAndResetCallback(onCancelDeleteModal.current));
        isDeleteCommentConfirmModalVisibleRef.current = false;
        setIsDeleteCommentConfirmModalVisible(false);
        setShouldSetModalVisibilityForDeleteConfirmation(true);
    };

    /** Opens the Confirm delete action modal */
    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = (reportID, reportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) => {
        onCancelDeleteModal.current = onCancel;

        onConfirmDeleteModal.current = onConfirm;
        reportIDRef.current = reportID;
        reportActionRef.current = reportAction ?? null;

        setDeleteModalTarget({reportID, reportAction: reportAction ?? null});
        setShouldSetModalVisibilityForDeleteConfirmation(shouldSetModalVisibility);
        isDeleteCommentConfirmModalVisibleRef.current = true;
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
        composerToRefocusOnCloseEmojiPicker: composerToRefocusOnClose,
    }));

    return (
        <>
            <PopoverWithMeasuredContent
                isVisible={isPopoverVisible}
                onClose={() => hideContextMenu()}
                onModalShow={runAndResetOnPopoverShow}
                onModalHide={runAndResetOnPopoverHide}
                anchorPosition={popoverAnchorPosition.current}
                animationIn="fadeIn"
                disableAnimation={false}
                shouldSetModalVisibility={false}
                fullscreen
                withoutOverlay={isWithoutOverlay}
                anchorDimensions={contextMenuDimensions.current}
                anchorRef={anchorRef}
                shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <BaseReportActionContextMenu
                    isVisible={isPopoverVisible}
                    type={typeRef.current}
                    reportID={reportIDRef.current}
                    reportActionID={reportActionIDRef.current}
                    selection={selectionRef.current}
                    isThreadReportParentAction={isThreadReportParentAction}
                    anchor={contextMenuTargetNode}
                    contentRef={contentRef}
                    originalReportID={originalReportIDRef.current}
                    disabledActions={disabledActions}
                    setIsEmojiPickerActive={onEmojiPickerToggle.current}
                    enableEdgeToEdgeBottomSafeAreaPadding
                />
            </PopoverWithMeasuredContent>
            {!!deleteModalTarget && (
                <DeleteReportActionConfirmModal
                    reportID={deleteModalTarget.reportID}
                    reportAction={deleteModalTarget.reportAction}
                    isVisible={isDeleteCommentConfirmModalVisible}
                    shouldSetModalVisibility={shouldSetModalVisibilityForDeleteConfirmation}
                    onConfirm={runConfirmDeleteCallback}
                    onClose={closeDeleteModal}
                    onCancel={hideDeleteModal}
                    onModalHide={finishDeleteModalHide}
                    deleteAfterModalHide={deleteCommentAfterModalHide}
                />
            )}
        </>
    );
}

export default PopoverReportActionContextMenu;
