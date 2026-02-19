import React, {createContext, useContext, useMemo, useReducer} from 'react';
import type {ReactNode} from 'react';
import {DEFAULT_STATE, stateReducer} from './stateReducer';
import type {MultifactorAuthenticationActionsContextType, MultifactorAuthenticationState, MultifactorAuthenticationStateContextType} from './types';

const MultifactorAuthenticationStateContext = createContext<MultifactorAuthenticationStateContextType | undefined>(undefined);
const MultifactorAuthenticationActionsContext = createContext<MultifactorAuthenticationActionsContextType | undefined>(undefined);

type MultifactorAuthenticationStateProviderProps = {
    children: ReactNode;
};

/**
 * Provider component that manages the global multifactor authentication state.
 * Uses a reducer pattern to handle complex state transitions and provides
 * separate state and actions contexts to all consuming components.
 * Must be placed high in the component tree to wrap all MFA-related screens.
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to MFA state
 * @returns The provider component wrapping children
 */
function MultifactorAuthenticationStateProvider({children}: MultifactorAuthenticationStateProviderProps) {
    const [state, dispatch] = useReducer(stateReducer, DEFAULT_STATE);
    const actions = useMemo(() => ({dispatch}), [dispatch]);

    return (
        <MultifactorAuthenticationStateContext.Provider value={state}>
            <MultifactorAuthenticationActionsContext.Provider value={actions}>{children}</MultifactorAuthenticationActionsContext.Provider>
        </MultifactorAuthenticationStateContext.Provider>
    );
}

/**
 * Hook to access the multifactor authentication state.
 * Must be called within a MultifactorAuthenticationStateProvider tree.
 *
 * @returns The current MultifactorAuthenticationState
 * @throws {Error} If used outside of MultifactorAuthenticationStateProvider
 */
function useMultifactorAuthenticationState(): MultifactorAuthenticationState {
    const context = useContext(MultifactorAuthenticationStateContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationState must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

/**
 * Hook to access the multifactor authentication actions (dispatch).
 * Must be called within a MultifactorAuthenticationStateProvider tree.
 *
 * @returns Object with dispatch function to update state
 * @throws {Error} If used outside of MultifactorAuthenticationStateProvider
 *
 * @example
 * const { dispatch } = useMultifactorAuthenticationActions();
 * dispatch({ type: 'SET_VALIDATE_CODE', payload: '123456' });
 */
function useMultifactorAuthenticationActions(): MultifactorAuthenticationActionsContextType {
    const context = useContext(MultifactorAuthenticationActionsContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationActions must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

MultifactorAuthenticationStateProvider.displayName = 'MultifactorAuthenticationStateProvider';

export default MultifactorAuthenticationStateProvider;
export {useMultifactorAuthenticationState, useMultifactorAuthenticationActions, MultifactorAuthenticationStateContext, MultifactorAuthenticationActionsContext, DEFAULT_STATE};
export type {MultifactorAuthenticationState, MultifactorAuthenticationStateContextType, MultifactorAuthenticationActionsContextType, ErrorState, Action} from './types';
