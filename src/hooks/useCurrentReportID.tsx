import type {NavigationState, PartialState} from '@react-navigation/native';
import React, {createContext, startTransition, useCallback, useContext, useMemo, useRef, useState} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';

type CurrentReportIDStateContextType = {
    currentReportID: string | undefined;
    currentRHPReportID?: string | undefined;
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

/**
 * Traverse the focused route at each level of the navigation state to find a reportID param.
 * This handles modal navigators (e.g. RightModalNavigator > ExpenseReport) that carry a reportID
 * in their screen params but are not part of the ReportsSplitNavigator hierarchy.
 */
function getFocusedRouteReportID(state: NavigationState | PartialState<NavigationState>): string | undefined {
    const index = state.index ?? state.routes.length - 1;
    const focusedRoute = state.routes[index];
    if (!focusedRoute) {
        return;
    }
    if (focusedRoute.params && 'reportID' in focusedRoute.params && typeof focusedRoute.params.reportID === 'string') {
        return focusedRoute.params.reportID;
    }
    if (focusedRoute.state) {
        return getFocusedRouteReportID(focusedRoute.state);
    }
}

const defaultCurrentReportIDActionsContext: CurrentReportIDActionsContextType = {
    updateCurrentReportID: () => {},
};

const CurrentReportIDStateContext = createContext<CurrentReportIDStateContextType>({currentReportID: undefined, currentRHPReportID: undefined});

const CurrentReportIDActionsContext = createContext<CurrentReportIDActionsContextType>(defaultCurrentReportIDActionsContext);

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState<string | undefined>('');
    const [currentRHPReportID, setCurrentRHPReportID] = useState<string | undefined>(undefined);
    // Tracks the most recently requested reportID synchronously so the dedupe
    // check below stays accurate even while a startTransition is pending.
    const pendingReportIDRef = useRef<string | undefined>('');

    /**
     * This function is used to update the currentReportID and currentRHPReportID
     * @param state root navigation state
     */
    const updateCurrentReportID = useCallback(
        (state: NavigationState) => {
            /*
             * Make sure we don't make the reportID undefined when switching between the chat list and settings tab.
             * This helps prevent unnecessary re-renders.
             */
            const params = state?.routes?.[state.index]?.params;
            if (params && 'screen' in params && typeof params.screen === 'string' && params.screen.indexOf('Settings_') !== -1) {
                return;
            }

            const reportID = Navigation.getTopmostReportId(state);

            if (pendingReportIDRef.current !== reportID) {
                if (pendingReportIDRef.current || reportID) {
                    pendingReportIDRef.current = reportID;
                    props.onSetCurrentReportID?.(reportID);
                    // Mark the report ID update as a non-urgent transition so React can keep the
                    // UI responsive to user input while the (potentially expensive) report screen
                    // re-render is processed in the background.
                    startTransition(() => {
                        setCurrentReportID(reportID);
                    });
                }
            }

            const focusedTopRoute = state.routes[state.index];
            const modalReportID = focusedTopRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && focusedTopRoute.state ? getFocusedRouteReportID(focusedTopRoute.state) : undefined;

            if (currentRHPReportID !== modalReportID && (currentRHPReportID || modalReportID)) {
                setCurrentRHPReportID(modalReportID);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to re-render when onSetCurrentReportID changes
        [setCurrentReportID, setCurrentRHPReportID, currentRHPReportID],
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
            currentRHPReportID,
        }),
        [currentReportID, currentRHPReportID],
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
