import Navigation from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import React, {createContext, startTransition, useContext, useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';

type CurrentReportIDStateContextType = {
    currentReportID: string | undefined;
};

type CurrentReportIDActionsContextType = {
    updateCurrentReportID: (state: NavigationState) => void;
};

type CurrentReportIDContextProviderProps = {
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

const CurrentReportIDStateContext = createContext<CurrentReportIDStateContextType>({currentReportID: undefined});

/**
 * Kept apart from the current report ID so components that only need that ID, like `ReportScreen` or `useSidebarOrderedReports`,
 * don't re-render when a report opens or closes in the RHP.
 */
const CurrentRHPReportIDContext = createContext<string | undefined>(undefined);

type CurrentReportIDStore = {
    get: () => string | undefined;
    set: (reportID: string | undefined) => void;
    subscribe: (onChange: () => void) => () => void;
};

function createCurrentReportIDStore(): CurrentReportIDStore {
    let currentReportID: string | undefined = '';
    const listeners = new Set<() => void>();
    return {
        get: () => currentReportID,
        set: (reportID) => {
            if (reportID === currentReportID) {
                return;
            }
            currentReportID = reportID;
            for (const listener of listeners) {
                listener();
            }
        },
        subscribe: (onChange) => {
            listeners.add(onChange);
            return () => {
                listeners.delete(onChange);
            };
        },
    };
}

const defaultCurrentReportIDStore: CurrentReportIDStore = {get: () => undefined, set: () => {}, subscribe: () => () => {}};

/**
 * Lets a component subscribe to whether one report is the current one. A component reading the current report ID
 * from context re-renders on every report switch, which would re-render every LHN row when only two of them change.
 */
const CurrentReportIDStoreContext = createContext<CurrentReportIDStore>(defaultCurrentReportIDStore);

const CurrentReportIDActionsContext = createContext<CurrentReportIDActionsContextType>(defaultCurrentReportIDActionsContext);

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState<string | undefined>('');
    const [currentRHPReportID, setCurrentRHPReportID] = useState<string | undefined>(undefined);
    // Tracks the most recently requested reportID synchronously so the dedupe
    // check below stays accurate even while a startTransition is pending.
    const pendingReportIDRef = useRef<string | undefined>('');
    const [store] = useState(createCurrentReportIDStore);

    // Synced after the commit so the report switch stays a transition, and before paint so the rows update in the same frame.
    // Store updates can't be transitions, so the rows that subscribe re-render synchronously here. Keep subscribers cheap.
    useLayoutEffect(() => {
        store.set(currentReportID);
    }, [store, currentReportID]);

    /**
     * This function is used to update the currentReportID and currentRHPReportID
     * @param state root navigation state
     */
    const updateCurrentReportID = (state: NavigationState) => {
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
    };

    const actionsContextValue: CurrentReportIDActionsContextType = {
        updateCurrentReportID,
    };

    const stateContextValue: CurrentReportIDStateContextType = {
        currentReportID,
    };

    return (
        <CurrentReportIDStateContext.Provider value={stateContextValue}>
            <CurrentRHPReportIDContext.Provider value={currentRHPReportID}>
                <CurrentReportIDStoreContext.Provider value={store}>
                    <CurrentReportIDActionsContext.Provider value={actionsContextValue}>{props.children}</CurrentReportIDActionsContext.Provider>
                </CurrentReportIDStoreContext.Provider>
            </CurrentRHPReportIDContext.Provider>
        </CurrentReportIDStateContext.Provider>
    );
}

function useCurrentReportIDState() {
    return useContext(CurrentReportIDStateContext);
}

/**
 * The store is synced in a layout effect, so for one commit after a report switch this disagrees with
 * `useCurrentReportIDState()`. Don't combine the two in one component.
 */
function useIsCurrentReportID(reportID: string) {
    const store = useContext(CurrentReportIDStoreContext);
    return useSyncExternalStore(store.subscribe, () => store.get() === reportID);
}

function useCurrentRHPReportID() {
    return useContext(CurrentRHPReportIDContext);
}

function useCurrentReportIDActions() {
    return useContext(CurrentReportIDActionsContext);
}

export {CurrentReportIDContextProvider, useCurrentReportIDState, useCurrentRHPReportID, useIsCurrentReportID, useCurrentReportIDActions};
