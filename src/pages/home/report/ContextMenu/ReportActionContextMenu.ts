import React from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, TextInput, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {ContextMenuAction} from './ContextMenuActions';

type OnHideCallback = () => void;

type OnConfirm = () => void;

type OnCancel = () => void;

type ContextMenuType = ValueOf<typeof CONST.CONTEXT_MENU_TYPES>;

type ContextMenuAnchor = View | RNText | TextInput | HTMLDivElement | null | undefined;

type ShowContextMenu = (
    type: ContextMenuType,
    event: GestureResponderEvent | MouseEvent,
    selection: string,
    contextMenuAnchor: ContextMenuAnchor,
    reportID?: string,
    reportActionID?: string,
    originalReportID?: string,
    draftMessage?: string,
    onShow?: () => void,
    onHide?: () => void,
    isArchivedRoom?: boolean,
    isChronosReport?: boolean,
    isPinnedChat?: boolean,
    isUnreadChat?: boolean,
    disabledOptions?: ContextMenuAction[],
    shouldCloseOnTarget?: boolean,
    setIsEmojiPickerActive?: (state: boolean) => void,
    isOverflowMenu?: boolean,
) => void;

type ReportActionContextMenu = {
    showContextMenu: ShowContextMenu;
    hideContextMenu: (callback?: OnHideCallback) => void;
    showDeleteModal: (reportID: string, reportAction: OnyxEntry<ReportAction>, shouldSetModalVisibility?: boolean, onConfirm?: OnConfirm, onCancel?: OnCancel) => void;
    hideDeleteModal: () => void;
    isActiveReportAction: (accountID: string | number) => boolean;
    instanceID: string;
    runAndResetOnPopoverHide: () => void;
    clearActiveReportAction: () => void;
    contentRef: RefObject<View>;
};

const contextMenuRef = React.createRef<ReportActionContextMenu>();

/**
 * Hide the ReportActionContextMenu modal popover.
 * Hides the popover menu with an optional delay
 * @param [shouldDelay] - whether the menu should close after a delay
 * @param [onHideCallback] - Callback to be called after Context Menu is completely hidden
 */
function hideContextMenu(shouldDelay?: boolean, onHideCallback = () => {}) {
    if (!contextMenuRef.current) {
        return;
    }
    if (!shouldDelay) {
        contextMenuRef.current.hideContextMenu(onHideCallback);

        return;
    }

    // Save the active instanceID for which hide action was called.
    // If menu is being closed with a delay, check that whether the same instance exists or a new was created.
    // If instance is not same, cancel the hide action
    const instanceID = contextMenuRef.current.instanceID;
    setTimeout(() => {
        if (contextMenuRef.current?.instanceID !== instanceID) {
            return;
        }

        contextMenuRef.current.hideContextMenu(onHideCallback);
    }, 800);
}

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param type - the context menu type to display [EMAIL, LINK, REPORT_ACTION, REPORT]
 * @param [event] - A press event.
 * @param [selection] - Copied content.
 * @param contextMenuAnchor - popoverAnchor
 * @param reportID - Active Report Id
 * @param reportActionID - ReportActionID for ContextMenu
 * @param originalReportID - The currrent Report Id of the reportAction
 * @param draftMessage - ReportAction Draftmessage
 * @param [onShow=() => {}] - Run a callback when Menu is shown
 * @param [onHide=() => {}] - Run a callback when Menu is hidden
 * @param isArchivedRoom - Whether the provided report is an archived room
 * @param isChronosReport - Flag to check if the chat participant is Chronos
 * @param isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
 * @param isUnreadChat - Flag to check if the chat has unread messages in the LHN. Used for the Mark as Read/Unread action
 */
function showContextMenu(
    type: ContextMenuType,
    event: GestureResponderEvent | MouseEvent,
    selection: string,
    contextMenuAnchor: ContextMenuAnchor,
    reportID = '-1',
    reportActionID = '-1',
    originalReportID = '-1',
    draftMessage: string | undefined = undefined,
    onShow = () => {},
    onHide = () => {},
    isArchivedRoom = false,
    isChronosReport = false,
    isPinnedChat = false,
    isUnreadChat = false,
    disabledActions: ContextMenuAction[] = [],
    shouldCloseOnTarget = false,
    setIsEmojiPickerActive = () => {},
    isOverflowMenu = false,
) {
    if (!contextMenuRef.current) {
        return;
    }
    const show = () => {
        contextMenuRef.current?.showContextMenu(
            type,
            event,
            selection,
            contextMenuAnchor,
            reportID,
            reportActionID,
            originalReportID,
            draftMessage,
            onShow,
            onHide,
            isArchivedRoom,
            isChronosReport,
            isPinnedChat,
            isUnreadChat,
            disabledActions,
            shouldCloseOnTarget,
            setIsEmojiPickerActive,
            isOverflowMenu,
        );
    };

    // If there is an already open context menu, close it first before opening
    // a new one.
    if (contextMenuRef.current.instanceID) {
        hideContextMenu(false, show);
        return;
    }

    show();
}

/**
 * Hides the Confirm delete action modal
 */
function hideDeleteModal() {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.hideDeleteModal();
}

/**
 * Opens the Confirm delete action modal
 */
function showDeleteModal(reportID: string, reportAction: OnyxEntry<ReportAction>, shouldSetModalVisibility?: boolean, onConfirm?: OnConfirm, onCancel?: OnCancel) {
    if (!contextMenuRef.current) {
        return;
    }
    contextMenuRef.current.showDeleteModal(reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel);
}

/**
 * Whether Context Menu is active for the Report Action.
 */
function isActiveReportAction(actionID: string | number): boolean {
    if (!contextMenuRef.current) {
        return false;
    }
    return contextMenuRef.current.isActiveReportAction(actionID);
}

function clearActiveReportAction() {
    if (!contextMenuRef.current) {
        return;
    }

    return contextMenuRef.current.clearActiveReportAction();
}

export {contextMenuRef, showContextMenu, hideContextMenu, isActiveReportAction, clearActiveReportAction, showDeleteModal, hideDeleteModal};
export type {ContextMenuType, ShowContextMenu, ReportActionContextMenu, ContextMenuAnchor};
