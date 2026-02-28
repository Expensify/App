import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
/* eslint-disable no-restricted-imports */
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, View} from 'react-native';
import {Dimensions} from 'react-native';
import {Actions, useActionSheetAwareScrollViewActions} from '@components/ActionSheetAwareScrollView';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import ConfirmDeleteReportActionModal from './ConfirmDeleteReportActionModal';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';

const EMPTY_DISABLED_ACTION_IDS = new Set<string>();

function extractPointerEvent(event: GestureResponderEvent | MouseEvent): MouseEvent | NativeTouchEvent {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}

type PopoverPosition = {
    anchorHorizontal: number;
    anchorVertical: number;
    anchorWidth: number;
    anchorHeight: number;
};

type PopoverContextMenuState = {
    type: ContextMenuType;
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    selection: string;
    draftMessage: string | undefined;
    isArchivedRoom: boolean;
    isChronos: boolean;
    isPinnedChat: boolean;
    isUnreadChat: boolean;
    isThreadReportParentAction: boolean;
    disabledActionIds: Set<string>;
    isOverflowMenu: boolean;
    withoutOverlay: boolean;
    position: PopoverPosition;
    contextMenuTargetNode: HTMLDivElement | null;
    onEmojiPickerToggle: ((state: boolean) => void) | undefined;
};

type PopoverReportActionContextMenuProps = {
    /** Reference to the outer element */
    ref?: ForwardedRef<ReportActionContextMenu>;
};

function PopoverReportActionContextMenu({ref}: PopoverReportActionContextMenuProps) {
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();
    const modalContext = useModal();

    const [menuState, setMenuState] = useState<PopoverContextMenuState | null>(null);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();

    const reportActionID = menuState?.reportActionID;

    const cursorRelativePosition = useRef({horizontal: 0, vertical: 0});
    const instanceIDRef = useRef('');

    const contentRef = useRef<View>(null);
    const anchorRef = useRef<View | HTMLDivElement | null>(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onPopoverHideActionCallback = useRef(() => {});

    const getContextMenuMeasuredLocation = () =>
        new Promise<{x: number; y: number}>((resolve) => {
            if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });

    const measureContextMenuAnchorPosition = () => {
        if (!isPopoverVisible) {
            return;
        }

        getContextMenuMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }

            setMenuState((prev) => {
                if (!prev) {
                    return prev;
                }
                return {
                    ...prev,
                    position: {
                        ...prev.position,
                        anchorHorizontal: cursorRelativePosition.current.horizontal + x,
                        anchorVertical: cursorRelativePosition.current.vertical + y,
                    },
                };
            });
        });
    };

    useEffect(() => {
        dimensionsEventListener.current = Dimensions.addEventListener('change', measureContextMenuAnchorPosition);

        return () => {
            if (!dimensionsEventListener.current) {
                return;
            }
            dimensionsEventListener.current.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPopoverVisible]);

    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) => !!actionID && reportActionID === String(actionID);

    const clearActiveReportAction = () => {
        setMenuState(null);
    };

    const showContextMenu: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction: reportActionParam = {},
            callbacks = {},
            disabledActionIds = new Set<string>(),
            shouldCloseOnTarget = false,
            isOverflowMenu = false,
            withoutOverlay = true,
        } = showContextMenuParams;
        if (ReportActionComposeFocusManager.isFocused()) {
            setComposerToRefocusOnClose('main');
        } else if (ReportActionComposeFocusManager.isEditFocused()) {
            setComposerToRefocusOnClose('edit');
        }

        const {reportID: showReportID, originalReportID: showOriginalReportID, isArchivedRoom = false, isChronos = false, isPinnedChat = false, isUnreadChat = false} = currentReport;
        const {reportActionID: showReportActionID, draftMessage, isThreadReportParentAction: isThreadReportParentActionParam = false} = reportActionParam;
        const {onShow = () => {}, onHide = () => {}, setIsEmojiPickerActive = () => {}} = callbacks;
        setIsContextMenuOpening(true);

        const {pageX = 0, pageY = 0} = extractPointerEvent(event);
        contextMenuAnchorRef.current = contextMenuAnchor;
        const targetNode = event.target as HTMLDivElement;
        if (shouldCloseOnTarget) {
            anchorRef.current = targetNode;
        } else {
            anchorRef.current = null;
        }

        onPopoverShow.current = onShow;
        onPopoverHide.current = onHide;

        new Promise<PopoverPosition>((resolve) => {
            const anchor = contextMenuAnchorRef.current;
            const useAnchorPosition = isOverflowMenu || (anchor != null && !pageX && !pageY);
            if (useAnchorPosition && anchor) {
                calculateAnchorPosition(anchor).then((position) => {
                    resolve({
                        anchorHorizontal: position.horizontal,
                        anchorVertical: position.vertical,
                        anchorWidth: position.width,
                        anchorHeight: position.height,
                    });
                });
            } else {
                getContextMenuMeasuredLocation().then(({x, y}) => {
                    cursorRelativePosition.current = {
                        horizontal: pageX - x,
                        vertical: pageY - y,
                    };
                    resolve({
                        anchorHorizontal: pageX,
                        anchorVertical: pageY,
                        anchorWidth: 0,
                        anchorHeight: 0,
                    });
                });
            }
        }).then((position) => {
            setMenuState({
                type,
                reportID: showReportID,
                reportActionID: showReportActionID,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                originalReportID: showOriginalReportID || undefined,
                selection,
                draftMessage,
                isArchivedRoom,
                isChronos,
                isPinnedChat,
                isUnreadChat,
                isThreadReportParentAction: isThreadReportParentActionParam,
                disabledActionIds,
                isOverflowMenu,
                withoutOverlay,
                position,
                contextMenuTargetNode: targetNode,
                onEmojiPickerToggle: setIsEmojiPickerActive,
            });
            setIsPopoverVisible(true);
        });
    };

    const runAndResetOnPopoverShow = () => {
        instanceIDRef.current = Math.random().toString(36).slice(2, 7);
        onPopoverShow.current();
        onPopoverShow.current = () => {};
        setTimeout(() => {
            setIsContextMenuOpening(false);
        }, CONST.ANIMATED_TRANSITION);
    };

    const runAndResetCallback = (callback: () => void) => {
        callback();
        return () => {};
    };

    const runAndResetOnPopoverHide = () => {
        setMenuState(null);
        instanceIDRef.current = '';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    const hideContextMenu: ReportActionContextMenu['hideContextMenu'] = (hideContextMenuParams) => {
        const {callbacks = {}} = hideContextMenuParams ?? {};

        if (typeof callbacks.onHide === 'function') {
            onPopoverHideActionCallback.current = callbacks.onHide;
        }

        setIsPopoverVisible(false);

        transitionActionSheetState({
            type: Actions.CLOSE_POPOVER,
        });

        refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose).then(() => {
            setComposerToRefocusOnClose(undefined);
        });
    };

    const isDeleteModalActiveRef = useRef(false);

    const hideDeleteModal = () => {
        if (!isDeleteModalActiveRef.current) {
            return;
        }
        modalContext.closeModal();
    };

    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = (
        showReportID,
        showReportAction,
        _shouldSetModalVisibility,
        onConfirm = () => {},
        onCancel = () => {},
        actionSourceReportID = undefined,
    ) => {
        if (!showReportID || !showReportAction?.reportActionID) {
            return;
        }

        setMenuState((prev) => ({
            ...(prev ?? {
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION as ContextMenuType,
                selection: '',
                draftMessage: undefined,
                isArchivedRoom: false,
                isChronos: false,
                isPinnedChat: false,
                isUnreadChat: false,
                isThreadReportParentAction: false,
                disabledActionIds: EMPTY_DISABLED_ACTION_IDS,
                isOverflowMenu: false,
                withoutOverlay: true,
                position: {anchorHorizontal: 0, anchorVertical: 0, anchorWidth: 0, anchorHeight: 0},
                contextMenuTargetNode: null,
                onEmojiPickerToggle: undefined,
            }),
            reportID: showReportID,
            reportActionID: showReportAction.reportActionID,
            originalReportID: prev?.originalReportID,
        }));

        isDeleteModalActiveRef.current = true;
        modalContext
            .showModal({
                component: ConfirmDeleteReportActionModal,
                props: {
                    reportID: showReportID,
                    reportActionID: showReportAction.reportActionID,
                    actionSourceReportID,
                },
            })
            .then((result) => {
                isDeleteModalActiveRef.current = false;
                if (result.action === ModalActions.CONFIRM) {
                    onConfirm();
                } else {
                    onCancel();
                }
                clearActiveReportAction();
            });
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
        <PopoverWithMeasuredContent
            isVisible={isPopoverVisible}
            onClose={() => hideContextMenu()}
            onModalShow={runAndResetOnPopoverShow}
            onModalHide={runAndResetOnPopoverHide}
            anchorPosition={{
                horizontal: menuState?.position.anchorHorizontal ?? 0,
                vertical: menuState?.position.anchorVertical ?? 0,
            }}
            animationIn="fadeIn"
            disableAnimation={false}
            shouldSetModalVisibility={false}
            fullscreen
            withoutOverlay={menuState?.withoutOverlay ?? true}
            anchorDimensions={{
                width: menuState?.position.anchorWidth ?? 0,
                height: menuState?.position.anchorHeight ?? 0,
            }}
            anchorRef={anchorRef}
            shouldSwitchPositionIfOverflow={menuState?.isOverflowMenu ?? false}
        >
            <BaseReportActionContextMenu
                isVisible={isPopoverVisible}
                type={menuState?.type}
                reportID={menuState?.reportID}
                reportActionID={menuState?.reportActionID}
                draftMessage={menuState?.draftMessage}
                selection={menuState?.selection ?? ''}
                isArchivedRoom={menuState?.isArchivedRoom ?? false}
                isChronosReport={menuState?.isChronos ?? false}
                isPinnedChat={menuState?.isPinnedChat ?? false}
                isUnreadChat={menuState?.isUnreadChat ?? false}
                isThreadReportParentAction={menuState?.isThreadReportParentAction ?? false}
                anchor={{current: menuState?.contextMenuTargetNode ?? null}}
                contentRef={contentRef}
                originalReportID={menuState?.originalReportID}
                disabledActionIds={menuState?.disabledActionIds ?? EMPTY_DISABLED_ACTION_IDS}
                setIsEmojiPickerActive={menuState?.onEmojiPickerToggle}
            />
        </PopoverWithMeasuredContent>
    );
}

export default PopoverReportActionContextMenu;
