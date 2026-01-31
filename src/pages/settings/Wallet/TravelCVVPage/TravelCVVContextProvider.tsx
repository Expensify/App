import type {PropsWithChildren} from 'react';
import React, {createContext, useContext, useState} from 'react';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {TravelCVVActionsContextType, TravelCVVStateContextType} from './types';

const defaultActionsContext: TravelCVVActionsContextType = {
    setCvv: () => {},
    setIsLoading: () => {},
    setValidateError: () => {},
};

const TravelCVVStateContext = createContext<TravelCVVStateContextType>({
    cvv: null,
    isLoading: false,
    validateError: {},
});

const TravelCVVActionsContext = createContext<TravelCVVActionsContextType>(defaultActionsContext);

/**
 * Context to display revealed travel card CVV data and pass it between screens.
 * CVV is stored only in React state (never persisted) for security.
 */
function TravelCVVContextProvider({children}: PropsWithChildren) {
    const [cvv, setCvv] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validateError, setValidateError] = useState<Errors>({});

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue: TravelCVVActionsContextType = {
        setCvv,
        setIsLoading,
        setValidateError,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateContextValue: TravelCVVStateContextType = {
        cvv,
        isLoading,
        validateError,
    };

    return (
        <TravelCVVActionsContext.Provider value={actionsContextValue}>
            <TravelCVVStateContext.Provider value={stateContextValue}>{children}</TravelCVVStateContext.Provider>
        </TravelCVVActionsContext.Provider>
    );
}

function useTravelCVVState(): TravelCVVStateContextType {
    return useContext(TravelCVVStateContext);
}

function useTravelCVVActions(): TravelCVVActionsContextType {
    return useContext(TravelCVVActionsContext);
}

export default TravelCVVContextProvider;
export {useTravelCVVState, useTravelCVVActions};
