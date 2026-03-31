import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

type InboxPanelStateContextValue = {
    isOpen: boolean;
};

type InboxPanelActionsContextValue = {
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
};

const InboxPanelStateContext = createContext<InboxPanelStateContextValue>({isOpen: false});

const InboxPanelActionsContext = createContext<InboxPanelActionsContextValue>({
    openPanel: () => {},
    closePanel: () => {},
    togglePanel: () => {},
});

function InboxPanelProvider({children}: {children: ReactNode}) {
    const [isOpen, setIsOpen] = useState(false);

    const openPanel = useCallback(() => setIsOpen(true), []);
    const closePanel = useCallback(() => setIsOpen(false), []);
    const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

    const stateValue = useMemo(() => ({isOpen}), [isOpen]);
    const actionsValue = useMemo(() => ({openPanel, closePanel, togglePanel}), [openPanel, closePanel, togglePanel]);

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
