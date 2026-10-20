import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import {accountIDSelector} from '@selectors/Session';
import React, {createContext, useContext, useState} from 'react';

type ConciergeChatHistoryStateContextType = {
    /** Whether the main Concierge chat shows its earlier conversation instead of the welcome screen */
    showFullHistory: boolean;
};

type ConciergeChatHistoryActionsContextType = {
    setShowFullHistory: (show: boolean) => void;
};

const ConciergeChatHistoryStateContext = createContext<ConciergeChatHistoryStateContextType>({
    showFullHistory: false,
});

const ConciergeChatHistoryActionsContext = createContext<ConciergeChatHistoryActionsContextType>({
    setShowFullHistory: () => {},
});

function ConciergeChatHistoryProvider({children}: PropsWithChildren) {
    const [showFullHistory, setShowFullHistory] = useState(false);

    // Collapse the history when the user switches accounts.
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [prevAccountID, setPrevAccountID] = useState(accountID);
    if (prevAccountID !== accountID) {
        setPrevAccountID(accountID);
        setShowFullHistory(false);
    }

    const stateValue = {showFullHistory};
    const actionsValue = {setShowFullHistory};

    return (
        <ConciergeChatHistoryStateContext.Provider value={stateValue}>
            <ConciergeChatHistoryActionsContext.Provider value={actionsValue}>{children}</ConciergeChatHistoryActionsContext.Provider>
        </ConciergeChatHistoryStateContext.Provider>
    );
}

function useConciergeChatHistoryState(): ConciergeChatHistoryStateContextType {
    return useContext(ConciergeChatHistoryStateContext);
}

function useConciergeChatHistoryActions(): ConciergeChatHistoryActionsContextType {
    return useContext(ConciergeChatHistoryActionsContext);
}

export {ConciergeChatHistoryProvider, useConciergeChatHistoryActions, useConciergeChatHistoryState};
