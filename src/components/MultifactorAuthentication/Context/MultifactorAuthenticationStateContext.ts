import {createContext, useContext} from 'react';

import type {MultifactorAuthenticationState, MultifactorAuthenticationStateContextType} from './types';

const MultifactorAuthenticationStateContext = createContext<MultifactorAuthenticationStateContextType | undefined>(undefined);

function useMultifactorAuthenticationState(): MultifactorAuthenticationState {
    const context = useContext(MultifactorAuthenticationStateContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationState must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

export default MultifactorAuthenticationStateContext;
export {useMultifactorAuthenticationState};
