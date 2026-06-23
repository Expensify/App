import React, {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import {requestPusherReinitialize} from '@userActions/requestPusherReinitialize';

type PusherReinitializationActionsContextType = {
    requestReinitialize: () => Promise<void>;
};

const PusherReinitializationActionsContext = createContext<PusherReinitializationActionsContextType>({
    requestReinitialize: requestPusherReinitialize,
});

type PusherReinitializationContextProviderProps = {
    children: ReactNode;
};

function PusherReinitializationContextProvider({children}: PusherReinitializationContextProviderProps) {
    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue = {
        requestReinitialize: requestPusherReinitialize,
    };

    return <PusherReinitializationActionsContext.Provider value={actionsContextValue}>{children}</PusherReinitializationActionsContext.Provider>;
}

function usePusherReinitializationActions() {
    return useContext(PusherReinitializationActionsContext);
}

export {PusherReinitializationContextProvider, usePusherReinitializationActions};
