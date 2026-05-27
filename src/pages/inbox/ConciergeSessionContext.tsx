import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
 * Session clearing uses two mechanisms:
 * 1. "State during render" pattern on currentReportID (handles direct navigation detection)
 * 2. "Pending clear" from endSession (handles component unmount with deferred resolution)
 */
function ConciergeSessionProvider({children}: PropsWithChildren) {
    const {currentReportID} = useCurrentReportIDState();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeMainDM = !!currentReportID && currentReportID === conciergeReportID;

    const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [hadMessagesAtSessionStart, setHadMessagesAtSessionStart] = useState(false);
    const [prevIsConciergeMainDM, setPrevIsConciergeMainDM] = useState(isConciergeMainDM);
    const [pendingClear, setPendingClear] = useState(false);

    if (pendingClear && currentReportID) {
        setPendingClear(false);
        if (currentReportID !== conciergeReportID) {
            setSessionStartTime(null);
            setShowFullHistory(false);
            setHadMessagesAtSessionStart(false);
        }
    }

    if (prevIsConciergeMainDM !== isConciergeMainDM) {
        setPrevIsConciergeMainDM(isConciergeMainDM);
        if (!isConciergeMainDM) {
            // Only clear the session when navigating to a report or the
            // chat list (LHN). Preserve for non-report pages like Settings
            // (Claim Offer → /settings/subscription).
            const activeRoute = Navigation.getActiveRoute();
            const isReportOrInbox = activeRoute.startsWith('/r/') || activeRoute === `/${ROUTES.INBOX}`;
            if (isReportOrInbox) {
                setSessionStartTime(null);
                setShowFullHistory(false);
                setHadMessagesAtSessionStart(false);
            }
        }
    }

    const startSession = useCallback((unreadBoundary?: string | null) => {
        setSessionStartTime((prev) => {
            if (prev) {
                return prev;
            }
            const now = DateUtils.getDBTime();
            if (unreadBoundary && unreadBoundary < now) {
                return unreadBoundary;
            }
            return now;
        });
    }, []);

    const endSession = useCallback(() => {
        setPendingClear(true);
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
