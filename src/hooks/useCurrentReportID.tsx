import type {NavigationState} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';

type CurrentReportIDStateContextType = {
    currentReportID: string | undefined;
};

type CurrentReportIDActionsContextType = {
    updateCurrentReportID: (state: NavigationState) => void;
};

type CurrentReportIDContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
    /** Optional callback invoked whenever `currentReportID` is explicitly updated.
     * This is intended only for unit testing, to detect when the hook
     * actually attempts to change the `currentReportID` value.
     */
    onSetCurrentReportID?: (reportID: string | undefined) => void;
};

const defaultCurrentReportIDActionsContext: CurrentReportIDActionsContextType = {
    updateCurrentReportID: () => {},
};

const CurrentReportIDStateContext = createContext<CurrentReportIDStateContextType>({currentReportID: undefined});

const CurrentReportIDActionsContext = createContext<CurrentReportIDActionsContextType>(defaultCurrentReportIDActionsContext);

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState<string | undefined>('');

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

            props.onSetCurrentReportID?.(reportID);
            setCurrentReportID(reportID);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to re-render when onSetCurrentReportID changes
        [setCurrentReportID, currentReportID],
    );

    const actionsContextValue = useMemo<CurrentReportIDActionsContextType>(
        () => ({
            updateCurrentReportID,
        }),
        [updateCurrentReportID],
    );

    const stateContextValue = useMemo<CurrentReportIDStateContextType>(
        () => ({
            currentReportID,
        }),
        [currentReportID],
    );

    return (
        <CurrentReportIDStateContext.Provider value={stateContextValue}>
            <CurrentReportIDActionsContext.Provider value={actionsContextValue}>{props.children}</CurrentReportIDActionsContext.Provider>
        </CurrentReportIDStateContext.Provider>
    );
}

function useCurrentReportIDState() {
    return useContext(CurrentReportIDStateContext);
}

function useCurrentReportIDActions() {
    return useContext(CurrentReportIDActionsContext);
}

export {CurrentReportIDContextProvider, useCurrentReportIDState, useCurrentReportIDActions};

// Backward compatible type alias
type CurrentReportIDContextValue = CurrentReportIDStateContextType & CurrentReportIDActionsContextType;

export type {CurrentReportIDContextValue};
