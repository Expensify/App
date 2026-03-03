import type {RefObject} from 'react';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, NativeTouchEvent, View as ViewType} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {Dimensions} from 'react-native';
import {Actions, useActionSheetAwareScrollViewActions} from '@components/ActionSheetAwareScrollView';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useRestoreInputFocus from '@hooks/useRestoreInputFocus';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ConfirmDeleteReportActionModal from './ConfirmDeleteReportActionModal';
import PopoverEmailContent from './PopoverEmailContent';
import PopoverLinkContent from './PopoverLinkContent';
import PopoverReportContent from './PopoverReportContent';
import PopoverReportActionContent from './PopoverReportActionContent';
import PopoverTextContent from './PopoverTextContent';

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
    isOverflowMenu: boolean;
    withoutOverlay: boolean;
    position: PopoverPosition;
    contextMenuTargetNode: HTMLDivElement | null;
    onEmojiPickerToggle: ((state: boolean) => void) | undefined;
};

type PopoverContentProps = {
    menuState: PopoverContextMenuState;
    hideAndRun: (callback?: () => void) => void;
    setLocalShouldKeepOpen: (value: boolean) => void;
    transitionActionSheetState: (params: {type: string; payload?: Record<string, unknown>}) => void;
    contentRef: RefObject<ViewType | null>;
    shouldEnableArrowNavigation: boolean;
};

type PopoverContextMenuProps = {
    ref?: React.Ref<ReportActionContextMenu>;
};

function PopoverContextMenu({ref: forwardedRef}: PopoverContextMenuProps) {
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();
    const modalContext = useModal();

    const [menuState, setMenuState] = useState<PopoverContextMenuState | null>(null);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();
    const [localShouldKeepOpen, setLocalShouldKeepOpen] = useState(false);

    const reportActionID = menuState?.reportActionID;

    const cursorRelativePosition = useRef({horizontal: 0, vertical: 0});
    const instanceIDRef = useRef('');

    const contentRef = useRef<ViewType>(null);
    const anchorRef = useRef<ViewType | HTMLDivElement | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onPopoverHideActionCallback = useRef(() => {});

    useRestoreInputFocus(isPopoverVisible);

    const getContextMenuMeasuredLocation = () =>
        new Promise<{x: number; y: number}>((resolve) => {
            if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });

    useEffect(() => {
        if (!isPopoverVisible) {
            return;
        }

        const listener = Dimensions.addEventListener('change', () => {
            new Promise<{x: number; y: number}>((resolve) => {
                if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                    contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
                } else {
                    resolve({x: 0, y: 0});
                }
            }).then(({x, y}) => {
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
        });

        return () => {
            listener.remove();
        };
    }, [isPopoverVisible]);

    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) => !!actionID && reportActionID === String(actionID);

    const clearActiveReportAction = () => {
        setMenuState(null);
    };

    const showContextMenuHandler: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction: reportActionParam = {},
            callbacks = {},
            shouldCloseOnTarget = false,
            isOverflowMenu = false,
            withoutOverlay = true,
        } = showContextMenuParams;
        if (ReportActionComposeFocusManager.isFocused()) {
            setComposerToRefocusOnClose('main');
        } else if (ReportActionComposeFocusManager.isEditFocused()) {
            setComposerToRefocusOnClose('edit');
        }

        const {reportID: showReportID, originalReportID: showOriginalReportID} = currentReport;
        const {reportActionID: showReportActionID, draftMessage} = reportActionParam;
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

    const hideContextMenuHandler: ReportActionContextMenu['hideContextMenu'] = (hideContextMenuParams) => {
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

    useImperativeHandle(forwardedRef, () => ({
        showContextMenu: showContextMenuHandler,
        hideContextMenu: hideContextMenuHandler,
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

    const hideAndRun = (callback?: () => void) => {
        hideContextMenu(false, callback);
    };

    const shouldKeepOpen = localShouldKeepOpen;
    const shouldEnableArrowNavigation = isPopoverVisible || shouldKeepOpen;

    return (
        <PopoverWithMeasuredContent
            isVisible={isPopoverVisible}
            onClose={() => hideContextMenuHandler()}
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
            {menuState?.type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && (
                <PopoverReportActionContent
                    menuState={menuState}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    transitionActionSheetState={transitionActionSheetState}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {menuState?.type === CONST.CONTEXT_MENU_TYPES.REPORT && (
                <PopoverReportContent
                    menuState={menuState}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    transitionActionSheetState={transitionActionSheetState}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {menuState?.type === CONST.CONTEXT_MENU_TYPES.LINK && (
                <PopoverLinkContent
                    menuState={menuState}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    transitionActionSheetState={transitionActionSheetState}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {menuState?.type === CONST.CONTEXT_MENU_TYPES.EMAIL && (
                <PopoverEmailContent
                    menuState={menuState}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    transitionActionSheetState={transitionActionSheetState}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {menuState?.type === CONST.CONTEXT_MENU_TYPES.TEXT && (
                <PopoverTextContent
                    menuState={menuState}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    transitionActionSheetState={transitionActionSheetState}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
        </PopoverWithMeasuredContent>
    );
}

PopoverContextMenu.displayName = 'PopoverContextMenu';

export default PopoverContextMenu;
export type {PopoverPosition, PopoverContextMenuState, PopoverContentProps};
