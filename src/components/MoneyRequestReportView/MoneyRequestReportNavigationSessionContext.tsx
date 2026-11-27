import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext, useState} from 'react';

type MoneyRequestReportNavigationSession = {
    queryHash: number;

    reports: Array<string | undefined>;

    requestedPageOffset: number | undefined;

    answeredLiveOffset: number;

    settledSnapshotOffset: number;
};

type SaveMoneyRequestReportNavigationSession = (session: MoneyRequestReportNavigationSession) => void;

const MoneyRequestReportNavigationSessionStateContext = createContext<MoneyRequestReportNavigationSession | undefined>(undefined);

const MoneyRequestReportNavigationSessionActionsContext = createContext<SaveMoneyRequestReportNavigationSession>(() => {});

function MoneyRequestReportNavigationSessionProvider({children}: ChildrenProps) {
    const [session, saveSession] = useState<MoneyRequestReportNavigationSession>();

    return (
        <MoneyRequestReportNavigationSessionActionsContext.Provider value={saveSession}>
            <MoneyRequestReportNavigationSessionStateContext.Provider value={session}>{children}</MoneyRequestReportNavigationSessionStateContext.Provider>
        </MoneyRequestReportNavigationSessionActionsContext.Provider>
    );
}

function useMoneyRequestReportNavigationSession(queryHash: number | undefined): MoneyRequestReportNavigationSession | undefined {
    const session = useContext(MoneyRequestReportNavigationSessionStateContext);

    return session?.queryHash === queryHash ? session : undefined;
}

function useSaveMoneyRequestReportNavigationSession(): SaveMoneyRequestReportNavigationSession {
    return useContext(MoneyRequestReportNavigationSessionActionsContext);
}

export {MoneyRequestReportNavigationSessionProvider, useMoneyRequestReportNavigationSession, useSaveMoneyRequestReportNavigationSession};
