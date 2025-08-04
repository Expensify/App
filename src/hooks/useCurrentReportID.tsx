import type {NavigationState} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {getReportIDFromLink} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type CurrentReportIDContextValue = {
    updateCurrentReportID: (state: NavigationState) => void;
    currentReportID: string | undefined;
    currentReportIDFromPath: string | undefined;
};

type CurrentReportIDContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const CurrentReportIDContext = createContext<CurrentReportIDContextValue | null>(null);

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState<string | undefined>('');
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const lastAccessReportFromPath = getReportIDFromLink(lastVisitedPath ?? null);

    /**
     * This function is used to update the currentReportID
     * @param state root navigation state
     */
    const updateCurrentReportID = useCallback(
        (state: NavigationState) => {
            const reportID = Navigation.getTopmostReportId(state);

            /*
             * Make sure we don't make the reportID undefined when switching between the chat list and settings tab.
             * This helps prevent unnecessary re-renders.
             */
            const params = state?.routes?.[state.index]?.params;
            if (params && 'screen' in params && typeof params.screen === 'string' && params.screen.indexOf('Settings_') !== -1) {
                return;
            }

            // Prevent unnecessary updates when the report ID hasn't changed
            if (currentReportID === reportID) {
                return;
            }

            // Also prevent updates when both are undefined/null (no report context)
            if (!currentReportID && !reportID) {
                return;
            }
            setCurrentReportID(reportID);
        },
        [setCurrentReportID, currentReportID],
    );

    /**
     * The context this component exposes to child components
     * @returns currentReportID to share between central pane and LHN
     */
    const contextValue = useMemo(
        (): CurrentReportIDContextValue => ({
            updateCurrentReportID,
            currentReportID,
            currentReportIDFromPath: lastAccessReportFromPath || undefined,
        }),
        [updateCurrentReportID, currentReportID, lastAccessReportFromPath],
    );

    return <CurrentReportIDContext.Provider value={contextValue}>{props.children}</CurrentReportIDContext.Provider>;
}

CurrentReportIDContextProvider.displayName = 'CurrentReportIDContextProvider';

export default function useCurrentReportID(): CurrentReportIDContextValue | null {
    return useContext(CurrentReportIDContext);
}

export {CurrentReportIDContextProvider};
export type {CurrentReportIDContextValue};
