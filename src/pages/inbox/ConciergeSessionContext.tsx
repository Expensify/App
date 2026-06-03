import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type ConciergeSessionStateContextType = {
    sessionStartTime: string | null;
    showFullHistory: boolean;
    hadMessagesAtSessionStart: boolean;
};

type ConciergeSessionActionsContextType = {
    startSession: (unreadBoundary?: string | null) => void;
    endSession: () => void;
    setShowFullHistory: (show: boolean) => void;
    setHadMessagesAtSessionStart: (value: boolean) => void;
};

const ConciergeSessionStateContext = createContext<ConciergeSessionStateContextType>({
    sessionStartTime: null,
    showFullHistory: false,
    hadMessagesAtSessionStart: false,
});

const ConciergeSessionActionsContext = createContext<ConciergeSessionActionsContextType>({
    startSession: () => {},
    endSession: () => {},
    setShowFullHistory: () => {},
    setHadMessagesAtSessionStart: () => {},
});

/**
 * Provides a stable sessionStartTime for the main Concierge DM.
 * Mounted at app level (App.tsx) so it never remounts.
 *
 * Session start is triggered eagerly by consumers (via startSession())
 * using useLayoutEffect, so the timestamp is set before the browser paints.
 *
 * Session reset uses a staleness check: if the existing session is older
 * than CONCIERGE_SESSION_EXPIRATION_MS (2 hours), it is discarded and a new
 * session begins. Brief detours (settings, workspace links, app going
 * to background) preserve the session; closing the app resets it
 * naturally since the state is React-only (not persisted to Onyx).
 */
function ConciergeSessionProvider({children}: PropsWithChildren) {
    const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [hadMessagesAtSessionStart, setHadMessagesAtSessionStart] = useState(false);

    const startSession = useCallback((unreadBoundary?: string | null) => {
        let sessionExpired = false;
        setSessionStartTime((prev) => {
            if (prev) {
                const elapsed = Date.now() - new Date(`${prev}Z`).getTime();
                if (elapsed < CONST.CONCIERGE_SESSION_EXPIRATION_MS) {
                    return prev;
                }
                sessionExpired = true;
            }
            const now = DateUtils.getDBTime();
            if (unreadBoundary && unreadBoundary < now) {
                return unreadBoundary;
            }
            return now;
        });
        if (sessionExpired) {
            setShowFullHistory(false);
            setHadMessagesAtSessionStart(false);
        }
    }, []);

    const endSession = useCallback(() => {
        // No-op: session persists until it expires or the app restarts.
        // Kept for API compatibility with the sidebar pattern.
    }, []);

    const stateValue = useMemo(() => ({sessionStartTime, showFullHistory, hadMessagesAtSessionStart}), [sessionStartTime, showFullHistory, hadMessagesAtSessionStart]);
    const actionsValue = useMemo(() => ({startSession, endSession, setShowFullHistory, setHadMessagesAtSessionStart}), [startSession, endSession]);

    return (
        <ConciergeSessionStateContext.Provider value={stateValue}>
            <ConciergeSessionActionsContext.Provider value={actionsValue}>{children}</ConciergeSessionActionsContext.Provider>
        </ConciergeSessionStateContext.Provider>
    );
}

function useConciergeSessionState(): ConciergeSessionStateContextType {
    return useContext(ConciergeSessionStateContext);
}

function useConciergeSessionActions(): ConciergeSessionActionsContextType {
    return useContext(ConciergeSessionActionsContext);
}

export {ConciergeSessionProvider, useConciergeSessionActions, useConciergeSessionState};
