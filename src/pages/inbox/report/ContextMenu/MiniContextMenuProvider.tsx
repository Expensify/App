import type {ReactNode, RefObject} from 'react';
import React, {createContext, useContext, useRef, useState} from 'react';
import type {ContextMenuAnchor} from './ReportActionContextMenu';

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

    /** Hide the mini context menu immediately. No-op while `keepOpen` is active; the hide intent is deferred until `release`. */
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
};

const MiniContextMenuActionsContext = createContext<MiniContextMenuActions>({
    showMiniContextMenu: () => {},
    hideMiniContextMenu: () => {},
    hideMiniContextMenuWithoutNotification: () => {},
    keepOpen: () => {},
    release: () => {},
});

const MiniContextMenuStateContext = createContext<MiniContextMenuState | null>(null);

type MiniContextMenuProviderProps = {
    children: ReactNode;
};

function MiniContextMenuProvider({children}: MiniContextMenuProviderProps) {
    const [state, setState] = useState<MiniContextMenuState | null>(null);
    const shouldKeepOpenRef = useRef(false);
    const pendingHideRef = useRef(false);
    const onMenuHideRef = useRef<(() => void) | null>(null);
    const activeReportActionIDRef = useRef<string | undefined>(undefined);

    const [actions] = useState<MiniContextMenuActions>(() => {
        const isGuarded = () => shouldKeepOpenRef.current;

        // Deferred to a microtask so that all event handlers in the current
        // task (e.g. both mouseleave on the row AND mouseenter on the menu)
        // finish and update refs before we decide whether to actually hide.
        const performHide = () => {
            queueMicrotask(() => {
                if (isGuarded()) {
                    pendingHideRef.current = true;
                    return;
                }
                setState((prev) => (prev ? {...prev, isVisible: false} : null));
                onMenuHideRef.current?.();
                onMenuHideRef.current = null;
                activeReportActionIDRef.current = undefined;
            });
        };

        const drainPendingHide = () => {
            if (!pendingHideRef.current || isGuarded()) {
                return;
            }
            pendingHideRef.current = false;
            performHide();
        };

        return {
            showMiniContextMenu: (params: ShowMiniContextMenuParams) => {
                const isSameRow = params.reportActionID === activeReportActionIDRef.current;
                if (!isSameRow) {
                    onMenuHideRef.current?.();
                }
                activeReportActionIDRef.current = params.reportActionID;
                const {onMenuHide, ...stateParams} = params;
                onMenuHideRef.current = onMenuHide ?? null;
                pendingHideRef.current = false;
                shouldKeepOpenRef.current = true;
                setState({...stateParams, isVisible: true});
            },
            hideMiniContextMenu: () => {
                if (isGuarded()) {
                    pendingHideRef.current = true;
                    return;
                }
                performHide();
            },
            hideMiniContextMenuWithoutNotification: () => {
                shouldKeepOpenRef.current = false;
                pendingHideRef.current = false;
                queueMicrotask(() => {
                    setState((prev) => (prev ? {...prev, isVisible: false} : null));
                    onMenuHideRef.current = null;
                    activeReportActionIDRef.current = undefined;
                });
            },
            keepOpen: () => {
                shouldKeepOpenRef.current = true;
                pendingHideRef.current = false;
            },
            release: () => {
                shouldKeepOpenRef.current = false;
                drainPendingHide();
            },
        };
    });

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
