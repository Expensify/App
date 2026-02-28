import type {ReactNode, RefObject} from 'react';
import React, {createContext, useContext, useRef, useState} from 'react';
import type {ContextMenuAnchor} from './ReportActionContextMenu';

const HIDE_DELAY_MS = 120;

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
    isArchivedRoom: boolean;
    isThreadReportParentAction: boolean;
    draftMessage: string | undefined;
    isChronosReport: boolean;
    checkIfContextMenuActive: () => void;
    setIsEmojiPickerActive: (state: boolean) => void;
    rowMeasurements: RowMeasurements;
};

type MiniContextMenuState = MiniContextMenuParams & {
    isVisible: boolean;
};

type MiniContextMenuActions = {
    showMiniContextMenu: (params: MiniContextMenuParams) => void;
    hideMiniContextMenu: (options?: {immediate?: boolean}) => void;
    cancelHide: () => void;
    keepOpen: () => void;
    release: () => void;
};

const MiniContextMenuActionsContext = createContext<MiniContextMenuActions>({
    showMiniContextMenu: () => {},
    hideMiniContextMenu: () => {},
    cancelHide: () => {},
    keepOpen: () => {},
    release: () => {},
});

const MiniContextMenuStateContext = createContext<MiniContextMenuState | null>(null);

type MiniContextMenuProviderProps = {
    children: ReactNode;
};

function MiniContextMenuProvider({children}: MiniContextMenuProviderProps) {
    const [state, setState] = useState<MiniContextMenuState | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldKeepOpenRef = useRef(false);
    const pendingHideRef = useRef(false);

    const [actions] = useState<MiniContextMenuActions>(() => {
        const clearHideTimer = () => {
            if (hideTimerRef.current == null) {
                return;
            }
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        };

        const performHide = () => {
            clearHideTimer();
            setState((prev) => (prev ? {...prev, isVisible: false} : null));
        };

        return {
            showMiniContextMenu: (params: MiniContextMenuParams) => {
                clearHideTimer();
                pendingHideRef.current = false;
                setState({...params, isVisible: true});
            },
            hideMiniContextMenu: (options) => {
                if (shouldKeepOpenRef.current) {
                    pendingHideRef.current = true;
                    return;
                }
                clearHideTimer();
                if (options?.immediate) {
                    performHide();
                } else {
                    hideTimerRef.current = setTimeout(performHide, HIDE_DELAY_MS);
                }
            },
            cancelHide: () => {
                clearHideTimer();
                pendingHideRef.current = false;
            },
            keepOpen: () => {
                shouldKeepOpenRef.current = true;
                clearHideTimer();
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

export {MiniContextMenuProvider, useMiniContextMenuActions, useMiniContextMenuState, MiniContextMenuActionsContext, MiniContextMenuStateContext};
export type {MiniContextMenuParams, MiniContextMenuState, RowMeasurements, MiniContextMenuActions};
