import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
/* eslint-disable no-restricted-imports */
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, View} from 'react-native';
import {DeviceEventEmitter, Dimensions, InteractionManager} from 'react-native';
import {Actions, useActionSheetAwareScrollViewActions} from '@components/ActionSheetAwareScrollView';
import ConfirmModal from '@components/ConfirmModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {deleteTrackExpense} from '@libs/actions/IOU';
import {deleteAppReport, deleteReportComment} from '@libs/actions/Report';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getOriginalMessage, isMoneyRequestAction, isReportPreviewAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import type {ContextMenuAction} from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';

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
    disabledActions: ContextMenuAction[];
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
    const {translate} = useLocalize();
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();

    const [menuState, setMenuState] = useState<PopoverContextMenuState | null>(null);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();

    const reportID = menuState?.reportID;
    const reportActionID = menuState?.reportActionID;

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const reportAction = reportActions?.[reportActionID ?? ''];

    const isReportArchived = useReportIsArchived(reportID);
    const isOriginalReportArchived = useReportIsArchived(getOriginalReportID(reportID, reportAction, reportActions));
    const {iouReport, chatReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(reportAction);

    const cursorRelativePosition = useRef({horizontal: 0, vertical: 0});
    const instanceIDRef = useRef('');
    const {email, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [isDeleteCommentConfirmModalVisible, setIsDeleteCommentConfirmModalVisible] = useState(false);
    const [shouldSetModalVisibilityForDeleteConfirmation, setShouldSetModalVisibilityForDeleteConfirmation] = useState(true);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const contentRef = useRef<View>(null);
    const anchorRef = useRef<View | HTMLDivElement | null>(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onCancelDeleteModal = useRef(() => {});
    const onConfirmDeleteModal = useRef(() => {});
    const onPopoverHideActionCallback = useRef(() => {});
    const callbackWhenDeleteModalHide = useRef(() => {});

    /** Get the Context menu anchor position. We calculate the anchor coordinates from measureInWindow async method */
    const getContextMenuMeasuredLocation = () =>
        new Promise<{x: number; y: number}>((resolve) => {
            if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });

    /** This gets called on Dimensions change to find the anchor coordinates for the action context menu. */
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

    /** Whether Context Menu is active for the Report Action. */
    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) => !!actionID && reportActionID === String(actionID);

    const clearActiveReportAction = () => {
        setMenuState(null);
    };

    /**
     * Show the ReportActionContextMenu modal popover.
     */
    const showContextMenu: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction: reportActionParam = {},
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
            if (!!(!pageX && !pageY && contextMenuAnchorRef.current) || isOverflowMenu) {
                calculateAnchorPosition(contextMenuAnchorRef.current).then((position) => {
                    resolve({
                        anchorHorizontal: position.horizontal,
                        anchorVertical: position.vertical,
                        anchorWidth: position.vertical,
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
                disabledActions: disabledOptions,
                isOverflowMenu,
                withoutOverlay,
                position,
                contextMenuTargetNode: targetNode,
                onEmojiPickerToggle: setIsEmojiPickerActive,
            });
            setIsPopoverVisible(true);
        });
    };

    /** After Popover shows, call the registered onPopoverShow callback and reset it */
    const runAndResetOnPopoverShow = () => {
        instanceIDRef.current = Math.random().toString(36).slice(2, 7);
        onPopoverShow.current();

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
        setMenuState(null);
        instanceIDRef.current = '';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param onHideActionCallback Callback to be called after popover is completely hidden
     */
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

    const transactionIDs: string[] = [];
    if (isMoneyRequestAction(reportAction)) {
        const originalMessage = getOriginalMessage(reportAction);
        if (originalMessage && 'IOUTransactionID' in originalMessage && !!originalMessage.IOUTransactionID) {
            transactionIDs.push(originalMessage.IOUTransactionID);
        }
    }

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionIDs);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const {currentSearchHash} = useSearchStateContext();
    const {deleteTransactions} = useDeleteTransactions({
        report,
        reportActions: reportAction ? [reportAction] : [],
        policy,
    });

    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getOriginalReportID(reportID, reportAction, reportActions)}`);
    const ancestorsRef = useRef<typeof ancestors>([]);
    const ancestors = useAncestors(originalReport);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(originalReport?.iouReportID);
    useEffect(() => {
        if (!originalReport) {
            return;
        }
        ancestorsRef.current = ancestors;
    }, [originalReport, ancestors]);
    const confirmDeleteAndHideModal = () => {
        callbackWhenDeleteModalHide.current = runAndResetCallback(onConfirmDeleteModal.current);
        if (isMoneyRequestAction(reportAction)) {
            const originalMessage = getOriginalMessage(reportAction);
            if (isTrackExpenseAction(reportAction)) {
                deleteTrackExpense({
                    chatReportID: reportID,
                    chatReport: report,
                    transactionID: originalMessage?.IOUTransactionID,
                    reportAction,
                    iouReport,
                    chatIOUReport: chatReport,
                    transactions: duplicateTransactions,
                    violations: duplicateTransactionViolations,
                    isSingleTransactionView: undefined,
                    isChatReportArchived: isReportArchived,
                    isChatIOUReportArchived,
                    allTransactionViolationsParam: allTransactionViolations,
                    currentUserAccountID,
                });
            } else if (originalMessage?.IOUTransactionID) {
                deleteTransactions([originalMessage.IOUTransactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash);
            }
        } else if (isReportPreviewAction(reportAction)) {
            deleteAppReport(childReport, selfDMReport, email ?? '', currentUserAccountID, reportTransactions, allTransactionViolations, bankAccountList, currentSearchHash);
        } else if (reportAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                deleteReportComment(report, reportAction, ancestorsRef.current, isReportArchived, isOriginalReportArchived, email ?? '', visibleReportActionsData ?? undefined);
            });
        }

        DeviceEventEmitter.emit(`deletedReportAction_${reportID}`, reportAction?.reportActionID);
        setIsDeleteCommentConfirmModalVisible(false);
    };

    const hideDeleteModal = () => {
        callbackWhenDeleteModalHide.current = () => (onCancelDeleteModal.current = runAndResetCallback(onCancelDeleteModal.current));
        setIsDeleteCommentConfirmModalVisible(false);
        setShouldSetModalVisibilityForDeleteConfirmation(true);
    };

    /** Opens the Confirm delete action modal */
    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = (showReportID, showReportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) => {
        onCancelDeleteModal.current = onCancel;
        onConfirmDeleteModal.current = onConfirm;

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
                disabledActions: [],
                isOverflowMenu: false,
                withoutOverlay: true,
                position: {anchorHorizontal: 0, anchorVertical: 0, anchorWidth: 0, anchorHeight: 0},
                contextMenuTargetNode: null,
                onEmojiPickerToggle: undefined,
            }),
            reportID: showReportID,
            reportActionID: showReportAction?.reportActionID,
            originalReportID: prev?.originalReportID,
        }));

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
        composerToRefocusOnCloseEmojiPicker: composerToRefocusOnClose,
    }));

    return (
        <>
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
                    disabledActions={menuState?.disabledActions ?? []}
                    setIsEmojiPickerActive={menuState?.onEmojiPickerToggle}
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

export default PopoverReportActionContextMenu;
