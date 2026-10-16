import type {ReactNode} from 'react';

import React, {useEffect, useReducer, useRef} from 'react';

import type {Action} from './types';

import MultifactorAuthenticationActionsContext from './MultifactorAuthenticationActionsContext';
import {MultifactorAuthenticationContextProvider} from './MultifactorAuthenticationMainContext';
import MultifactorAuthenticationStateContext from './MultifactorAuthenticationStateContext';
import {DEFAULT_STATE, stateReducer} from './stateReducer';

type MultifactorAuthenticationProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationStateProvider({children}: MultifactorAuthenticationProviderProps) {
    const [state, reducerDispatch] = useReducer(stateReducer, DEFAULT_STATE);
    const executionRef = useRef({controller: new AbortController(), started: false});
    useEffect(() => {
        // StrictMode replays setup after cleanup; never reuse its aborted generation.
        if (executionRef.current.controller.signal.aborted) {
            executionRef.current = {controller: new AbortController(), started: false};
        }
        return () => {
            executionRef.current.controller.abort();
            // Also invalidate cancellation outcome callbacks, which intentionally run with an aborted signal.
            executionRef.current = {...executionRef.current};
        };
    }, []);
    const dispatch = (action: Action) => {
        // Invalidate synchronously, including direct offline close and resets outside the main provider.
        // Duplicate INIT remains the reducer's responsibility and must not abort the active attempt.
        if (action.type === 'RESET' || action.type === 'REREGISTER') {
            executionRef.current.controller.abort();
            executionRef.current = {controller: new AbortController(), started: false};
        } else if (action.type === 'CLOSE_MODAL') {
            executionRef.current.controller.abort();
        }
        reducerDispatch(action);
    };
    const getActionExecution = () => executionRef.current;
    const actions = {dispatch, getActionExecution};

    return (
        <MultifactorAuthenticationStateContext.Provider value={state}>
            <MultifactorAuthenticationActionsContext.Provider value={actions}>{children}</MultifactorAuthenticationActionsContext.Provider>
        </MultifactorAuthenticationStateContext.Provider>
    );
}

MultifactorAuthenticationStateProvider.displayName = 'MultifactorAuthenticationStateProvider';

function MultifactorAuthenticationContextProviders({children}: MultifactorAuthenticationProviderProps) {
    return (
        <MultifactorAuthenticationStateProvider>
            <MultifactorAuthenticationContextProvider>{children}</MultifactorAuthenticationContextProvider>
        </MultifactorAuthenticationStateProvider>
    );
}

MultifactorAuthenticationContextProviders.displayName = 'MultifactorAuthenticationContextProviders';

export default MultifactorAuthenticationContextProviders;
export {DEFAULT_STATE, MultifactorAuthenticationStateProvider};
