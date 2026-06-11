import {createContext, useContext} from 'react';
import type {MultifactorAuthenticationActionsContextType} from './types';

const MultifactorAuthenticationActionsContext = createContext<MultifactorAuthenticationActionsContextType | undefined>(undefined);

function useMultifactorAuthenticationActions(): MultifactorAuthenticationActionsContextType {
    const context = useContext(MultifactorAuthenticationActionsContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationActions must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

export default MultifactorAuthenticationActionsContext;
export {useMultifactorAuthenticationActions};
