import React, {useMemo, useReducer} from 'react';
import type {ReactNode} from 'react';
import MultifactorAuthenticationActionsContext from './MultifactorAuthenticationActionsContext';
import {MultifactorAuthenticationContextProvider} from './MultifactorAuthenticationMainContext';
import MultifactorAuthenticationStateContext from './MultifactorAuthenticationStateContext';
import {DEFAULT_STATE, stateReducer} from './stateReducer';

type MultifactorAuthenticationProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationStateProvider({children}: MultifactorAuthenticationProviderProps) {
    const [state, dispatch] = useReducer(stateReducer, DEFAULT_STATE);
    const actions = useMemo(() => ({dispatch}), [dispatch]);

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
