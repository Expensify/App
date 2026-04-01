import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';

type InboxPanelStateContextValue = {
    isOpen: boolean;
    isFloating: boolean;
};

type InboxPanelActionsContextValue = {
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
    toggleFloating: () => void;
    /** Register a callback that navigates within the panel's stack to the given reportID. */
    registerPanelNavigation: (fn: (reportID: string) => void) => void;
    /** Navigate to a report inside the panel (and open the panel if closed). */
    navigateToReport: (reportID: string) => void;
};

const InboxPanelStateContext = createContext<InboxPanelStateContextValue>({isOpen: false, isFloating: false});

const InboxPanelActionsContext = createContext<InboxPanelActionsContextValue>({
    openPanel: () => {},
    closePanel: () => {},
    togglePanel: () => {},
    toggleFloating: () => {},
    registerPanelNavigation: () => {},
    navigateToReport: () => {},
});

function InboxPanelProvider({children}: {children: ReactNode}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFloating, setIsFloating] = useState(false);
    const panelNavigateRef = useRef<((reportID: string) => void) | null>(null);
    const pendingReportIDRef = useRef<string | null>(null);

    const openPanel = useCallback(() => setIsOpen(true), []);
    const closePanel = useCallback(() => setIsOpen(false), []);
    const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);
    const toggleFloating = useCallback(() => setIsFloating((prev) => !prev), []);

    const registerPanelNavigation = useCallback((fn: (reportID: string) => void) => {
        panelNavigateRef.current = fn;
        if (pendingReportIDRef.current) {
            fn(pendingReportIDRef.current);
            pendingReportIDRef.current = null;
        }
    }, []);

    const navigateToReport = useCallback((reportID: string) => {
        setIsOpen(true);
        if (panelNavigateRef.current) {
            panelNavigateRef.current(reportID);
        } else {
            pendingReportIDRef.current = reportID;
        }
    }, []);

    const stateValue = useMemo(() => ({isOpen, isFloating}), [isOpen, isFloating]);
    const actionsValue = useMemo(
        () => ({openPanel, closePanel, togglePanel, toggleFloating, registerPanelNavigation, navigateToReport}),
        [openPanel, closePanel, togglePanel, toggleFloating, registerPanelNavigation, navigateToReport],
    );

    return (
        <InboxPanelStateContext.Provider value={stateValue}>
            <InboxPanelActionsContext.Provider value={actionsValue}>{children}</InboxPanelActionsContext.Provider>
        </InboxPanelStateContext.Provider>
    );
}

function useInboxPanelState(): InboxPanelStateContextValue {
    return useContext(InboxPanelStateContext);
}

function useInboxPanelActions(): InboxPanelActionsContextValue {
    return useContext(InboxPanelActionsContext);
}

// Convenience hook that returns both — useful for components that need both state and actions.
function useInboxPanel(): InboxPanelStateContextValue & InboxPanelActionsContextValue {
    const state = useInboxPanelState();
    const actions = useInboxPanelActions();
    return useMemo(() => ({...state, ...actions}), [state, actions]);
}

export {InboxPanelProvider, useInboxPanel, useInboxPanelState, useInboxPanelActions};
