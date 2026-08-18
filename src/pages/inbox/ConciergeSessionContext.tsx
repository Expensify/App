import useOnyx from '@hooks/useOnyx';

import {getServerAnchoredDBTime} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';

type ConciergeSessionStateContextType = {
    sessionStartTime: string | null;
    showFullHistory: boolean;
    hadMessagesAtSessionStart: boolean;
};

type ConciergeSessionActionsContextType = {
    startSession: (unreadBoundary?: string | null) => void;
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
    setShowFullHistory: () => {},
    setHadMessagesAtSessionStart: () => {},
});

const accountIDSelector = (session: {accountID?: number} | undefined) => session?.accountID;

/**
 * Provides a stable sessionStartTime for the main Concierge DM.
 * Mounted at app level (App.tsx) so it never remounts.
 *
 * Session start is triggered eagerly by consumers (via startSession())
 * using useLayoutEffect, so the timestamp is set before the browser paints.
 *
 * Session reset uses a staleness check: if the session was created more
 * than CONCIERGE_SESSION_EXPIRATION_MS (2 hours) ago, it is discarded and
 * a new session begins. Brief detours (settings, workspace links, app
 * going to background) preserve the session; closing the app or switching
 * accounts resets it naturally.
 */
function ConciergeSessionProvider({children}: PropsWithChildren) {
    const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [hadMessagesAtSessionStart, setHadMessagesAtSessionStart] = useState(false);

    // Tracks when the session was actually created (Date.now()), separate
    // from sessionStartTime which may be an older unread boundary used for
    // display filtering. The age check uses this value so that an old
    // lastReadTime boundary doesn't cause premature expiration.
    const sessionCreatedAtRef = useRef<number | null>(null);

    // Reset the session when the user switches accounts. The provider is
    // mounted at the app level and never remounts, so without this the
    // previous user's session state would leak into the new account.
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [prevAccountID, setPrevAccountID] = useState(accountID);
    if (prevAccountID !== accountID) {
        setPrevAccountID(accountID);
        if (sessionStartTime !== null) {
            setSessionStartTime(null);
            setShowFullHistory(false);
            setHadMessagesAtSessionStart(false);
        }
    }

    const startSession = useCallback((unreadBoundary?: string | null) => {
        let sessionExpired = false;
        setSessionStartTime((prev) => {
            if (prev && sessionCreatedAtRef.current) {
                const elapsed = Date.now() - sessionCreatedAtRef.current;
                if (elapsed < CONST.CONCIERGE_SESSION_EXPIRATION_MS) {
                    // Within an active session, keep the existing boundary unless a better
                    // (earlier) unread boundary resolves after the session was created. On a
                    // cold open the session can lock to `now` before the unread anchor resolves;
                    // when it arrives we pull sessionStartTime back so the notification message
                    // isn't hidden behind "Show full history". The session age (sessionCreatedAtRef)
                    // is unchanged — only the display boundary is refined.
                    if (unreadBoundary && unreadBoundary < prev) {
                        return unreadBoundary;
                    }
                    return prev;
                }
                sessionExpired = true;
            }
            sessionCreatedAtRef.current = Date.now();
            const now = getServerAnchoredDBTime();
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

    const stateValue = useMemo(() => ({sessionStartTime, showFullHistory, hadMessagesAtSessionStart}), [sessionStartTime, showFullHistory, hadMessagesAtSessionStart]);
    const actionsValue = useMemo(() => ({startSession, setShowFullHistory, setHadMessagesAtSessionStart}), [startSession]);

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
