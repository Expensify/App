import type {ReactNode, RefObject} from 'react';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
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

    /** Lock the menu open so that `hideMiniContextMenu` calls are deferred until `release` is called. Use when a sub-interaction (overflow menu, emoji picker) needs the menu to stay visible. Also used by the menu's own Hoverable to prevent hide during row-to-menu hover transitions. */
    keepOpen: () => void;

    /** Unlock the menu after `keepOpen`. If a hide was deferred while locked, it executes immediately. */
    release: () => void;
};

const MiniContextMenuActionsContext = createContext<MiniContextMenuActions>({
    showMiniContextMenu: () => {},
    hideMiniContextMenu: () => {},
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

    useEffect(() => {
        if (state?.isVisible ?? false) {
            return;
        }
        onMenuHideRef.current?.();
        onMenuHideRef.current = null;
    }, [state?.isVisible]);

    const [actions] = useState<MiniContextMenuActions>(() => {
        const performHide = () => {
            setState((prev) => {
                if (shouldKeepOpenRef.current) {
                    pendingHideRef.current = true;
                    return prev;
                }
                return prev ? {...prev, isVisible: false} : null;
            });
        };

        return {
            showMiniContextMenu: (params: ShowMiniContextMenuParams) => {
                onMenuHideRef.current?.();
                const {onMenuHide, ...stateParams} = params;
                onMenuHideRef.current = onMenuHide ?? null;
                pendingHideRef.current = false;
                setState({...stateParams, isVisible: true});
            },
            hideMiniContextMenu: () => {
                if (shouldKeepOpenRef.current) {
                    pendingHideRef.current = true;
                    return;
                }
                performHide();
            },
            keepOpen: () => {
                shouldKeepOpenRef.current = true;
                pendingHideRef.current = false;
            },
            release: () => {
                shouldKeepOpenRef.current = false;
                if (pendingHideRef.current) {
                    pendingHideRef.current = false;
                    performHide();
                }
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
