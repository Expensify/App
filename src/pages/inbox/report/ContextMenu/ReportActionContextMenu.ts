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
    /** Delay before hiding (ms). Run on the UI thread via Reanimated.
     *  https://github.com/Expensify/App/issues/89069 */
    hideDelayMs?: number;
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

// Retry budget for waiting on the lazy-mounted popover ref.
// 10 attempts × ~16ms ≈ 160ms total, enough to cover React.lazy chunk load + commit
// on a cold start without blocking user interaction for long.
const MAX_CONTEXT_MENU_MOUNT_RETRIES = 10;
const CONTEXT_MENU_MOUNT_RETRY_INTERVAL_MS = 16;

// Bridge used when PopoverReportActionContextMenu is lazy-mounted: lets showContextMenu
// trigger eager mount if the user interacts before the idle-deferred mount runs.
let ensureContextMenuMounted: (() => void) | null = null;

function registerEnsureContextMenuMounted(handler: (() => void) | null) {
    ensureContextMenuMounted = handler;
}

// How long the success icon (Checkmark / "Copied!") stays visible before the menu hides.
const SUCCESS_STATE_HIDE_DELAY_MS = 800;

/**
 * Hide the ReportActionContextMenu modal popover.
 * @param [shouldDelay] - whether the menu should close after a delay
 * @param [onHideCallback] - Callback to be called after Context Menu is completely hidden
 */
function hideContextMenu(shouldDelay?: boolean, onHideCallback = () => {}, params?: HideContextMenuParams) {
    if (!contextMenuRef.current) {
        return;
    }

    contextMenuRef.current.hideContextMenu({
        ...params,
        callbacks: {
            ...params?.callbacks,
            onHide: onHideCallback,
        },
        ...(shouldDelay ? {hideDelayMs: SUCCESS_STATE_HIDE_DELAY_MS} : {}),
    });
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
        // Popover is lazy-mounted; trigger eager mount and retry until the ref is populated
        // so a fast cold-start interaction isn't silently dropped.
        ensureContextMenuMounted?.();
        let retries = MAX_CONTEXT_MENU_MOUNT_RETRIES;
        const attempt = () => {
            if (contextMenuRef.current) {
                showContextMenu(showContextMenuParams);
                return;
            }
            if (retries-- > 0) {
                setTimeout(attempt, CONTEXT_MENU_MOUNT_RETRY_INTERVAL_MS);
            }
        };
        attempt();
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

export {contextMenuRef, showContextMenu, hideContextMenu, isActiveReportAction, clearActiveReportAction, showDeleteModal, hideDeleteModal, registerEnsureContextMenuMounted};
export type {ContextMenuType, ReportActionContextMenu, ContextMenuAnchor};
