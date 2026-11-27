import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';

import {readNewestAction} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import {accountIDSelector} from '@selectors/Session';
import React, {createContext, useContext, useState} from 'react';

type ConciergeChatHistoryStateContextType = {
    /** Whether the main Concierge chat shows its earlier conversation instead of the welcome screen */
    showFullHistory: boolean;

    /** Whether the user collapsed the earlier conversation */
    isHistoryCollapsedByUser: boolean;
};

type ConciergeChatHistoryActionsContextType = {
    setShowFullHistory: (show: boolean) => void;

    /** Hides the earlier conversation and marks the Concierge chat as read */
    collapseHistory: () => void;
};

/** The main pane and the side panel can show the Concierge chat side by side, so each keeps its own history state */
type ConciergeChatHistoryByPane = {
    main: ConciergeChatHistoryStateContextType;
    sidePanel: ConciergeChatHistoryStateContextType;
};

type ConciergeChatHistoryPane = keyof ConciergeChatHistoryByPane;

type ConciergeChatHistoryActionsByPaneContextType = {
    setShowFullHistory: (pane: ConciergeChatHistoryPane, show: boolean) => void;
    collapseHistory: (pane: ConciergeChatHistoryPane) => void;
};

const DEFAULT_HISTORY_STATE: ConciergeChatHistoryStateContextType = {
    showFullHistory: false,
    isHistoryCollapsedByUser: false,
};

const DEFAULT_HISTORY_BY_PANE: ConciergeChatHistoryByPane = {
    main: DEFAULT_HISTORY_STATE,
    sidePanel: DEFAULT_HISTORY_STATE,
};

const ConciergeChatHistoryStateContext = createContext<ConciergeChatHistoryByPane>(DEFAULT_HISTORY_BY_PANE);

const ConciergeChatHistoryActionsContext = createContext<ConciergeChatHistoryActionsByPaneContextType>({
    setShowFullHistory: () => {},
    collapseHistory: () => {},
});

function ConciergeChatHistoryProvider({children}: PropsWithChildren) {
    const [historyByPane, setHistoryByPane] = useState(DEFAULT_HISTORY_BY_PANE);

    const setShowFullHistory = (pane: ConciergeChatHistoryPane, show: boolean) => {
        setHistoryByPane((previous) => {
            // Keep the same state object so neither pane rerenders when nothing changed.
            if (previous[pane].showFullHistory === show && previous[pane].isHistoryCollapsedByUser === !show) {
                return previous;
            }
            return {...previous, [pane]: {showFullHistory: show, isHistoryCollapsedByUser: !show}};
        });
    };

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const collapseHistory = (pane: ConciergeChatHistoryPane) => {
        setShowFullHistory(pane, false);
        readNewestAction(conciergeReportID, true);
    };

    // Collapse the history when the user switches accounts.
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [prevAccountID, setPrevAccountID] = useState(accountID);
    if (prevAccountID !== accountID) {
        setPrevAccountID(accountID);
        setHistoryByPane(DEFAULT_HISTORY_BY_PANE);
    }

    const actionsValue = {setShowFullHistory, collapseHistory};

    return (
        <ConciergeChatHistoryStateContext.Provider value={historyByPane}>
            <ConciergeChatHistoryActionsContext.Provider value={actionsValue}>{children}</ConciergeChatHistoryActionsContext.Provider>
        </ConciergeChatHistoryStateContext.Provider>
    );
}

function useConciergeChatHistoryState(): ConciergeChatHistoryStateContextType {
    const isInSidePanel = useIsInSidePanel();
    const historyByPane = useContext(ConciergeChatHistoryStateContext);
    return isInSidePanel ? historyByPane.sidePanel : historyByPane.main;
}

/**
 * Acts on the history of the pane this hook renders in.
 * Callers outside the side panel that open the Concierge chat there pass `isInSidePanel` to act on the side panel instead.
 */
function useConciergeChatHistoryActions(isInSidePanelOverride?: boolean): ConciergeChatHistoryActionsContextType {
    const isInSidePanel = useIsInSidePanel();
    const actions = useContext(ConciergeChatHistoryActionsContext);
    const pane: ConciergeChatHistoryPane = (isInSidePanelOverride ?? isInSidePanel) ? 'sidePanel' : 'main';
    return {
        setShowFullHistory: (show: boolean) => actions.setShowFullHistory(pane, show),
        collapseHistory: () => actions.collapseHistory(pane),
    };
}

export {ConciergeChatHistoryProvider, useConciergeChatHistoryActions, useConciergeChatHistoryState};
