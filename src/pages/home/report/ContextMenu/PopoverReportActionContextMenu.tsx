import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
/* eslint-disable no-restricted-imports */
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, View} from 'react-native';
import {DeviceEventEmitter, Dimensions} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {Actions, ActionSheetAwareScrollViewContext} from '@components/ActionSheetAwareScrollView';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ConfirmModal from '@components/ConfirmModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import {useSearchContext} from '@components/Search/SearchContext';
import useAncestors from '@hooks/useAncestors';
import useConfirmModal from '@hooks/useConfirmModal';
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
import Navigation from '@libs/Navigation/Navigation';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getOriginalMessage, isMoneyRequestAction, isReportPreviewAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorDimensions} from '@src/styles';
import type {ReportAction} from '@src/types/onyx';
import type {Location} from '@src/types/utils/Layout';
import BaseReportActionContextMenu from './BaseReportActionContextMenu';
import type {ContextMenuAction} from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';

function extractPointerEvent(event: GestureResponderEvent | MouseEvent): MouseEvent | NativeTouchEvent {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}

type PopoverReportActionContextMenuProps = {
    /** Reference to the outer element */
    ref?: ForwardedRef<ReportActionContextMenu>;
};

function PopoverReportActionContextMenu({ref}: PopoverReportActionContextMenuProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const reportIDRef = useRef<string | undefined>(undefined);
    const typeRef = useRef<ContextMenuType | undefined>(undefined);
    const reportActionRef = useRef<NonNullable<OnyxEntry<ReportAction>> | null>(null);
    const reportActionIDRef = useRef<string | undefined>(undefined);
    const originalReportIDRef = useRef<string | undefined>(undefined);
    const selectionRef = useRef('');
    const reportActionDraftMessageRef = useRef<string | undefined>(undefined);
    const isReportArchived = useReportIsArchived(reportIDRef.current);
    const isOriginalReportArchived = useReportIsArchived(getOriginalReportID(reportIDRef.current, reportActionRef.current));
    const {iouReport, chatReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(reportActionRef.current);
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
    const {email} = useCurrentUserPersonalDetails();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);

    const [isRoomArchived, setIsRoomArchived] = useState(false);
    const [isChronosReportEnabled, setIsChronosReportEnabled] = useState(false);
    const [isChatPinned, setIsChatPinned] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isThreadReportParentAction, setIsThreadReportParentAction] = useState(false);
    const [disabledActions, setDisabledActions] = useState<ContextMenuAction[]>([]);
    const [shouldSwitchPositionIfOverflow, setShouldSwitchPositionIfOverflow] = useState(false);
    const [isWithoutOverlay, setIsWithoutOverlay] = useState<boolean>(true);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});

    const contentRef = useRef<View>(null);
    const anchorRef = useRef<View | HTMLDivElement | null>(null);
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

    const onPopoverHideActionCallback = useRef(() => {});

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
     * @param draftMessage - ReportAction draft message
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

        const {reportID, originalReportID, isArchivedRoom = false, isChronos = false, isPinnedChat = false, isUnreadChat = false} = currentReport;
        const {reportActionID, draftMessage, isThreadReportParentAction: isThreadReportParentActionParam = false} = reportAction;
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
    const hideContextMenu: ReportActionContextMenu['hideContextMenu'] = (hideContextMenuParams) => {
        const {callbacks = {}} = hideContextMenuParams ?? {};

        if (typeof callbacks.onHide === 'function') {
            onPopoverHideActionCallback.current = callbacks.onHide;
        }

        selectionRef.current = '';
        reportActionDraftMessageRef.current = undefined;
        setIsPopoverVisible(false);

        transitionActionSheetState({
            type: Actions.CLOSE_POPOVER,
        });

        refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose).then(() => {
            setComposerToRefocusOnClose(undefined);
        });
    };

    const transactionIDs: string[] = [];
    if (isMoneyRequestAction(reportActionRef.current)) {
        const originalMessage = getOriginalMessage(reportActionRef.current);
        if (originalMessage && 'IOUTransactionID' in originalMessage && !!originalMessage.IOUTransactionID) {
            transactionIDs.push(originalMessage.IOUTransactionID);
        }
    }

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionIDs);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDRef.current}`, {
        canBeMissing: true,
    });
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const {currentSearchHash} = useSearchContext();
    const {deleteTransactions} = useDeleteTransactions({
        report,
        reportActions: reportActionRef.current ? [reportActionRef.current] : [],
        policy,
    });

    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getOriginalReportID(reportIDRef.current, reportActionRef.current)}`, {
        canBeMissing: true,
    });
    const ancestorsRef = useRef<typeof ancestors>([]);
    const ancestors = useAncestors(originalReport);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(originalReport?.iouReportID);
    useEffect(() => {
        if (!originalReport) {
            return;
        }
        ancestorsRef.current = ancestors;
    }, [originalReport, ancestors]);
    /** Opens the Confirm delete action modal */
    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = async (reportID, reportAction, shouldSetModalVisibility = true, onConfirm = () => {}, onCancel = () => {}) => {
        reportIDRef.current = reportID;
        reportActionRef.current = reportAction ?? null;

        const result = await showConfirmModal({
            title: translate('reportActionContextMenu.deleteAction', {action: reportAction}),
            prompt: translate('reportActionContextMenu.deleteConfirmation', {action: reportAction}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldSetModalVisibility,
            onModalHide: () => {
                clearActiveReportAction();
            },
        });
        if (result.action === ModalActions.CONFIRM) {
            onConfirm();
            const currentReportAction = reportActionRef.current;
            if (isMoneyRequestAction(currentReportAction)) {
                const originalMessage = getOriginalMessage(currentReportAction);
                if (isTrackExpenseAction(currentReportAction)) {
                    deleteTrackExpense({
                        chatReportID: reportIDRef.current,
                        chatReport: report,
                        transactionID: originalMessage?.IOUTransactionID,
                        reportAction: currentReportAction,
                        iouReport,
                        chatIOUReport: chatReport,
                        transactions: duplicateTransactions,
                        violations: duplicateTransactionViolations,
                        isSingleTransactionView: undefined,
                        isChatReportArchived: isReportArchived,
                        isChatIOUReportArchived,
                        allTransactionViolationsParam: allTransactionViolations,
                    });
                } else if (originalMessage?.IOUTransactionID) {
                    deleteTransactions([originalMessage.IOUTransactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash);
                }
            } else if (isReportPreviewAction(currentReportAction)) {
                deleteAppReport(currentReportAction.childReportID, email ?? '', reportTransactions, allTransactionViolations, bankAccountList);
            } else if (currentReportAction) {
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    deleteReportComment(reportIDRef.current, currentReportAction, ancestorsRef.current, isReportArchived, isOriginalReportArchived, email ?? '');
                });
            }

            DeviceEventEmitter.emit(`deletedReportAction_${reportIDRef.current}`, currentReportAction?.reportActionID);
        } else {
            onCancel();
        }
    };

    const hideDeleteModal = () => {
        setIsRoomArchived(false);
        setIsChronosReportEnabled(false);
        setIsChatPinned(false);
        setHasUnreadMessages(false);
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
            anchorPosition={popoverAnchorPosition.current}
            animationIn="fadeIn"
            disableAnimation={false}
            shouldSetModalVisibility={false}
            fullscreen
            withoutOverlay={isWithoutOverlay}
            anchorDimensions={contextMenuDimensions.current}
            anchorRef={anchorRef}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
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
    );
}

export default PopoverReportActionContextMenu;
