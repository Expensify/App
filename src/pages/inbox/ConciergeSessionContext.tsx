import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type ConciergeSessionStateContextType = {
    sessionStartTime: string | null;
    showFullHistory: boolean;
};

type ConciergeSessionActionsContextType = {
    startSession: (unreadBoundary?: string | null) => void;
    endSession: () => void;
    setShowFullHistory: (show: boolean) => void;
};

const ConciergeSessionStateContext = createContext<ConciergeSessionStateContextType>({
    sessionStartTime: null,
    showFullHistory: false,
});

const ConciergeSessionActionsContext = createContext<ConciergeSessionActionsContextType>({
    startSession: () => {},
    endSession: () => {},
    setShowFullHistory: () => {},
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
    const [prevIsConciergeMainDM, setPrevIsConciergeMainDM] = useState(isConciergeMainDM);
    const [pendingClear, setPendingClear] = useState(false);

    if (pendingClear && currentReportID) {
        setPendingClear(false);
        if (currentReportID !== conciergeReportID) {
            setSessionStartTime(null);
            setShowFullHistory(false);
        }
    }

    if (prevIsConciergeMainDM !== isConciergeMainDM) {
        setPrevIsConciergeMainDM(isConciergeMainDM);
        if (!isConciergeMainDM && !!currentReportID && currentReportID !== conciergeReportID) {
            setSessionStartTime(null);
            setShowFullHistory(false);
        } else if (isConciergeMainDM && !sessionStartTime) {
            setSessionStartTime(DateUtils.getDBTime());
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

    const stateValue = useMemo(() => ({sessionStartTime, showFullHistory}), [sessionStartTime, showFullHistory]);
    const actionsValue = useMemo(() => ({startSession, endSession, setShowFullHistory}), [startSession, endSession]);

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
