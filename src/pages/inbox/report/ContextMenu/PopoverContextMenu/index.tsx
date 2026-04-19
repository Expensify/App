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
import PopoverReportActionContent from './PopoverReportActionContent';
import PopoverReportContent from './PopoverReportContent';
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

type PopoverContextMenuProps = {
    ref?: React.Ref<ReportActionContextMenu>;
};

function PopoverContextMenu({ref: forwardedRef}: PopoverContextMenuProps) {
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();
    const modalContext = useModal();

    const [type, setType] = useState<ContextMenuType | null>(null);
    const [reportID, setReportID] = useState<string | undefined>();
    const [reportActionID, setReportActionID] = useState<string | undefined>();
    const [originalReportID, setOriginalReportID] = useState<string | undefined>();
    const [selection, setSelection] = useState('');
    const [draftMessage, setDraftMessage] = useState<string | undefined>();
    const [isOverflowMenu, setIsOverflowMenu] = useState(false);
    const [withoutOverlay, setWithoutOverlay] = useState(true);
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({anchorHorizontal: 0, anchorVertical: 0, anchorWidth: 0, anchorHeight: 0});
    const [contextMenuTargetNode, setContextMenuTargetNode] = useState<HTMLDivElement | null>(null);
    const [onEmojiPickerToggle, setOnEmojiPickerToggle] = useState<((state: boolean) => void) | undefined>();
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();
    const [localShouldKeepOpen, setLocalShouldKeepOpen] = useState(false);

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

                setPopoverPosition((prev) => ({
                    ...prev,
                    anchorHorizontal: cursorRelativePosition.current.horizontal + x,
                    anchorVertical: cursorRelativePosition.current.vertical + y,
                }));
            });
        });

        return () => {
            listener.remove();
        };
    }, [isPopoverVisible]);

    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) => !!actionID && reportActionID === String(actionID);

    const clearActiveReportAction = () => {
        setType(null);
        setReportID(undefined);
        setReportActionID(undefined);
        setOriginalReportID(undefined);
        setSelection('');
        setDraftMessage(undefined);
        setIsOverflowMenu(false);
        setWithoutOverlay(true);
        setPopoverPosition({anchorHorizontal: 0, anchorVertical: 0, anchorWidth: 0, anchorHeight: 0});
        setContextMenuTargetNode(null);
        setOnEmojiPickerToggle(undefined);
    };

    const showContextMenuHandler: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type: showType,
            event,
            selection: showSelection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction: reportActionParam = {},
            callbacks = {},
            shouldCloseOnTarget = false,
            isOverflowMenu: showIsOverflowMenu = false,
            withoutOverlay: showWithoutOverlay = true,
        } = showContextMenuParams;
        if (ReportActionComposeFocusManager.isFocused()) {
            setComposerToRefocusOnClose('main');
        } else if (ReportActionComposeFocusManager.isEditFocused()) {
            setComposerToRefocusOnClose('edit');
        }

        const {reportID: showReportID, originalReportID: showOriginalReportID} = currentReport;
        const {reportActionID: showReportActionID, draftMessage: showDraftMessage} = reportActionParam;
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
            const useAnchorPosition = showIsOverflowMenu || (anchor != null && !pageX && !pageY);
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
            setType(showType);
            setReportID(showReportID);
            setReportActionID(showReportActionID);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            setOriginalReportID(showOriginalReportID || undefined);
            setSelection(showSelection);
            setDraftMessage(showDraftMessage);
            setIsOverflowMenu(showIsOverflowMenu);
            setWithoutOverlay(showWithoutOverlay);
            setPopoverPosition(position);
            setContextMenuTargetNode(targetNode);
            setOnEmojiPickerToggle(() => setIsEmojiPickerActive);
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
        clearActiveReportAction();
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

        setReportID(showReportID);
        setReportActionID(showReportAction.reportActionID);

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
                horizontal: popoverPosition.anchorHorizontal,
                vertical: popoverPosition.anchorVertical,
            }}
            animationIn="fadeIn"
            disableAnimation={false}
            shouldSetModalVisibility={false}
            fullscreen
            withoutOverlay={withoutOverlay}
            anchorDimensions={{
                width: popoverPosition.anchorWidth,
                height: popoverPosition.anchorHeight,
            }}
            anchorRef={anchorRef}
            shouldSwitchPositionIfOverflow={isOverflowMenu}
        >
            {type === CONST.CONTEXT_MENU_TYPES.REPORT_ACTION && (
                <PopoverReportActionContent
                    reportID={reportID}
                    reportActionID={reportActionID}
                    originalReportID={originalReportID}
                    draftMessage={draftMessage}
                    selection={selection}
                    contextMenuTargetNode={contextMenuTargetNode}
                    onEmojiPickerToggle={onEmojiPickerToggle}
                    hideAndRun={hideAndRun}
                    setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {type === CONST.CONTEXT_MENU_TYPES.REPORT && (
                <PopoverReportContent
                    reportID={reportID}
                    reportActionID={reportActionID}
                    originalReportID={originalReportID}
                    hideAndRun={hideAndRun}
                    contentRef={contentRef}
                    shouldEnableArrowNavigation={shouldEnableArrowNavigation}
                />
            )}
            {type === CONST.CONTEXT_MENU_TYPES.LINK && (
                <PopoverLinkContent
                    selection={selection}
                    contentRef={contentRef}
                />
            )}
            {type === CONST.CONTEXT_MENU_TYPES.EMAIL && (
                <PopoverEmailContent
                    selection={selection}
                    contentRef={contentRef}
                />
            )}
            {type === CONST.CONTEXT_MENU_TYPES.TEXT && (
                <PopoverTextContent
                    selection={selection}
                    contentRef={contentRef}
                />
            )}
        </PopoverWithMeasuredContent>
    );
}

PopoverContextMenu.displayName = 'PopoverContextMenu';

export default PopoverContextMenu;
export type {PopoverPosition};
