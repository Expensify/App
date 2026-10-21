import useOnyx from '@hooks/useOnyx';

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
};

const ConciergeChatHistoryStateContext = createContext<ConciergeChatHistoryStateContextType>({
    showFullHistory: false,
    isHistoryCollapsedByUser: false,
});

const ConciergeChatHistoryActionsContext = createContext<ConciergeChatHistoryActionsContextType>({
    setShowFullHistory: () => {},
});

function ConciergeChatHistoryProvider({children}: PropsWithChildren) {
    const [showFullHistory, setShowFullHistoryState] = useState(false);
    const [isHistoryCollapsedByUser, setIsHistoryCollapsedByUser] = useState(false);

    const setShowFullHistory = (show: boolean) => {
        setShowFullHistoryState(show);
        setIsHistoryCollapsedByUser(!show);
    };

    // Collapse the history when the user switches accounts.
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [prevAccountID, setPrevAccountID] = useState(accountID);
    if (prevAccountID !== accountID) {
        setPrevAccountID(accountID);
        setShowFullHistoryState(false);
        setIsHistoryCollapsedByUser(false);
    }

    const stateValue = {showFullHistory, isHistoryCollapsedByUser};
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
