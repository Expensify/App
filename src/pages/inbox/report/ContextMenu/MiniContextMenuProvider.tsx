import type {ReactNode, RefObject} from 'react';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import type {ContextMenuAnchor} from './ReportActionContextMenu';

/**
 * Grace period between a hide being requested (e.g. row mouseleave) and the menu actually hiding.
 * Gives the menu's own Hoverable a window to cancel the hide when the cursor lands on it, enabling
 * seamless row → menu hover transitions without the menu flickering off.
 */
const HIDE_GRACE_PERIOD_MS = 80;

type RowMeasurements = {
    top: number;
    height: number;
    right: number;
};

type MiniContextMenuParams = {
    reportID: string | undefined;
    reportActionID: string;
    originalReportID: string | undefined;
    anchor: RefObject<ContextMenuAnchor>;
    displayAsGroup: boolean;
    draftMessage: string | undefined;
    checkIfContextMenuActive: () => void;
    setIsEmojiPickerActive: (state: boolean) => void;
    rowMeasurements: RowMeasurements;
};

type ShowMiniContextMenuParams = MiniContextMenuParams & {
    onMenuHide?: () => void;
};

type MiniContextMenuState = MiniContextMenuParams & {
    isVisible: boolean;
};

type MiniContextMenuActions = {
    /** Display the mini context menu with the given parameters. */
    showMiniContextMenu: (params: ShowMiniContextMenuParams) => void;

    /**
     * Schedule hiding the mini context menu after a short grace period. The hide is cancellable
     * by a subsequent `showMiniContextMenu` or `keepOpen` call — this is what allows the cursor
     * to transition from the hovered row onto the menu itself without the menu flickering away.
     * While `keepOpen` is active the hide intent is deferred until `release` is called.
     */
    hideMiniContextMenu: () => void;

    /**
     * Hide the mini menu without invoking `onMenuHide` (e.g. when opening the full popover context menu while the pointer stays over the row).
     * Clears the keep-open guard so the menu actually hides.
     */
    hideMiniContextMenuWithoutNotification: () => void;

    /** Lock the menu open so that `hideMiniContextMenu` calls are deferred until `release` is called. Use when a sub-interaction (overflow menu, emoji picker) needs the menu to stay visible. Also used by the menu's own Hoverable to prevent hide during row-to-menu hover transitions. */
    keepOpen: () => void;

    /** Unlock the menu after `keepOpen`. If a hide was deferred while locked, it executes immediately. */
    release: () => void;

    /** Ref to the mini menu's container element, used by PureReportActionItem to bridge Tab focus from the row to the Portal-rendered menu. */
    menuContainerRef: RefObject<HTMLElement | null>;
};

const MiniContextMenuActionsContext = createContext<MiniContextMenuActions>({
    showMiniContextMenu: () => {},
    hideMiniContextMenu: () => {},
    hideMiniContextMenuWithoutNotification: () => {},
    keepOpen: () => {},
    release: () => {},
    menuContainerRef: {current: null},
});

const MiniContextMenuStateContext = createContext<MiniContextMenuState | null>(null);

type MiniContextMenuProviderProps = {
    children: ReactNode;
};

function MiniContextMenuProvider({children}: MiniContextMenuProviderProps) {
    const [state, setState] = useState<MiniContextMenuState | null>(null);
    // Explicit lock for sub-interactions that must keep the menu pinned (overflow popover,
    // emoji picker, right-click popover). Unrelated to the grace-period hide timer below.
    const shouldKeepOpenRef = useRef(false);
    // Set when a hide was requested while locked; drained when `release()` is called.
    const pendingHideRef = useRef(false);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onMenuHideRef = useRef<(() => void) | null>(null);
    const activeReportActionIDRef = useRef<string | undefined>(undefined);
    const menuContainerRef = useRef<HTMLElement | null>(null);

    const [actions] = useState<MiniContextMenuActions>(() => {
        const cancelScheduledHide = () => {
            if (!hideTimeoutRef.current) {
                return;
            }
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        };

        const performHide = () => {
            hideTimeoutRef.current = null;
            setState((prev) => (prev ? {...prev, isVisible: false} : null));
            onMenuHideRef.current?.();
            onMenuHideRef.current = null;
            activeReportActionIDRef.current = undefined;
        };

        const scheduleHide = () => {
            if (shouldKeepOpenRef.current) {
                pendingHideRef.current = true;
                return;
            }
            if (hideTimeoutRef.current) {
                return;
            }
            hideTimeoutRef.current = setTimeout(performHide, HIDE_GRACE_PERIOD_MS);
        };

        return {
            showMiniContextMenu: (params: ShowMiniContextMenuParams) => {
                cancelScheduledHide();
                pendingHideRef.current = false;
                const isSameRow = params.reportActionID === activeReportActionIDRef.current;
                if (!isSameRow) {
                    onMenuHideRef.current?.();
                }
                activeReportActionIDRef.current = params.reportActionID;
                const {onMenuHide, ...stateParams} = params;
                onMenuHideRef.current = onMenuHide ?? null;
                setState({...stateParams, isVisible: true});
            },
            hideMiniContextMenu: () => {
                scheduleHide();
            },
            hideMiniContextMenuWithoutNotification: () => {
                cancelScheduledHide();
                shouldKeepOpenRef.current = false;
                pendingHideRef.current = false;
                setState((prev) => (prev ? {...prev, isVisible: false} : null));
                onMenuHideRef.current = null;
                activeReportActionIDRef.current = undefined;
            },
            keepOpen: () => {
                shouldKeepOpenRef.current = true;
                cancelScheduledHide();
                pendingHideRef.current = false;
            },
            release: () => {
                shouldKeepOpenRef.current = false;
                if (!pendingHideRef.current) {
                    return;
                }
                pendingHideRef.current = false;
                performHide();
            },
            menuContainerRef,
        };
    });

    useEffect(
        () => () => {
            if (!hideTimeoutRef.current) {
                return;
            }
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        },
        [],
    );

    return (
        <MiniContextMenuActionsContext.Provider value={actions}>
            <MiniContextMenuStateContext.Provider value={state}>{children}</MiniContextMenuStateContext.Provider>
        </MiniContextMenuActionsContext.Provider>
    );
}

function useMiniContextMenuActions(): MiniContextMenuActions {
    return useContext(MiniContextMenuActionsContext);
}

function useMiniContextMenuState(): MiniContextMenuState | null {
    return useContext(MiniContextMenuStateContext);
}

export {MiniContextMenuProvider, useMiniContextMenuActions, useMiniContextMenuState};
export type {MiniContextMenuParams, ShowMiniContextMenuParams, MiniContextMenuState, RowMeasurements, MiniContextMenuActions};
