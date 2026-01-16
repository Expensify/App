import React from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, TextInput, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import type CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {ContextMenuAction} from './ContextMenuActions';

type OnConfirm = () => void;

type OnCancel = () => void;

type ContextMenuType = ValueOf<typeof CONST.CONTEXT_MENU_TYPES>;

type ContextMenuAnchor = View | RNText | TextInput | HTMLDivElement | null | undefined;

type ShowContextMenuParams = {
    type: ContextMenuType;
    event: GestureResponderEvent | MouseEvent;
    selection: string;
    contextMenuAnchor: ContextMenuAnchor;
    report?: {
        reportID?: string;
        originalReportID?: string;
        isArchivedRoom?: boolean;
        isChronos?: boolean;
        isPinnedChat?: boolean;
        isUnreadChat?: boolean;
    };
    reportAction?: {
        reportActionID?: string;
        draftMessage?: string;
        isThreadReportParentAction?: boolean;
    };
    callbacks?: {
        onShow?: () => void;
        onHide?: () => void;
        setIsEmojiPickerActive?: (state: boolean) => void;
    };
    disabledOptions?: ContextMenuAction[];
    shouldCloseOnTarget?: boolean;
    isOverflowMenu?: boolean;
    withoutOverlay?: boolean;
};

type ShowContextMenu = (params: ShowContextMenuParams) => void;

type HideContextMenuParams = {
    callbacks?: {
        onHide?: () => void;
    };
};
type HideContextMenu = (params?: HideContextMenuParams) => void;

type ReportActionContextMenu = {
    showContextMenu: ShowContextMenu;
    hideContextMenu: HideContextMenu;
    showDeleteModal: (reportID: string, reportAction: OnyxEntry<ReportAction>, shouldSetModalVisibility?: boolean, onConfirm?: OnConfirm, onCancel?: OnCancel) => void;
    hideDeleteModal: () => void;
    isActiveReportAction: (accountID: string | number) => boolean;
    instanceIDRef: RefObject<string>;
    runAndResetOnPopoverHide: () => void;
    clearActiveReportAction: () => void;
    contentRef: RefObject<View | null>;
    isContextMenuOpening: boolean;
    composerToRefocusOnCloseEmojiPicker?: ComposerType;
};

const contextMenuRef = React.createRef<ReportActionContextMenu>();

/**
 * Hide the ReportActionContextMenu modal popover.
 * Hides the popover menu with an optional delay
 * @param [shouldDelay] - whether the menu should close after a delay
 * @param [onHideCallback] - Callback to be called after Context Menu is completely hidden
 */
function hideContextMenu(shouldDelay?: boolean, onHideCallback = () => {}, params?: HideContextMenuParams) {
    if (!contextMenuRef.current) {
        return;
    }

    const paramsWithCallback = {
        callbacks: {
            ...params?.callbacks,
            onHide: onHideCallback,
        },
        ...params,
    };

    if (!shouldDelay) {
        contextMenuRef.current.hideContextMenu(paramsWithCallback);
        return;
    }

    // Save the active instanceID for which hide action was called.
    // If menu is being closed with a delay, check that whether the same instance exists or a new was created.
    // If instance is not same, cancel the hide action
    const instanceID = contextMenuRef.current.instanceIDRef.current;
    setTimeout(() => {
        if (contextMenuRef.current?.instanceIDRef.current !== instanceID) {
            return;
        }

        contextMenuRef.current.hideContextMenu(paramsWithCallback);
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
 * @param originalReportID - The current Report Id of the reportAction
 * @param draftMessage - ReportAction draft message
 * @param [onShow=() => {}] - Run a callback when Menu is shown
 * @param [onHide=() => {}] - Run a callback when Menu is hidden
 * @param isArchivedRoom - Whether the provided report is an archived room
 * @param isChronosReport - Flag to check if the chat participant is Chronos
 * @param isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
 * @param isUnreadChat - Flag to check if the chat has unread messages in the LHN. Used for the Mark as Read/Unread action
 */
function showContextMenu(showContextMenuParams: ShowContextMenuParams) {
    if (!contextMenuRef.current) {
        return;
    }
    const show = () => {
        contextMenuRef.current?.showContextMenu(showContextMenuParams);
    };

    // If there is an already open context menu, close it first before opening
    // a new one.
    if (contextMenuRef.current.instanceIDRef.current) {
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
function showDeleteModal(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>, shouldSetModalVisibility?: boolean, onConfirm?: OnConfirm, onCancel?: OnCancel) {
    if (!contextMenuRef.current || !reportID) {
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
export type {ContextMenuType, ReportActionContextMenu, ContextMenuAnchor};
