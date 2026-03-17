import type {PropsWithChildren} from 'react';
import React, {createContext, useContext, useState} from 'react';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {defaultTravelCVVActionsContextValue, defaultTravelCVVStateContextValue} from './default';
import type {TravelCVVActionsContextType, TravelCVVStateContextType} from './types';

const TravelCVVStateContext = createContext<TravelCVVStateContextType>(defaultTravelCVVStateContextValue);
const TravelCVVActionsContext = createContext<TravelCVVActionsContextType>(defaultTravelCVVActionsContextValue);

/**
 * Context to display revealed travel card CVV data and pass it between screens.
 * CVV is stored only in React state (never persisted) for security.
 */
function TravelCVVContextProvider({children}: PropsWithChildren) {
    const [cvv, setCvv] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validateError, setValidateError] = useState<Errors>({});

    const stateValue: TravelCVVStateContextType = {
        cvv,
        isLoading,
        validateError,
    };

    const actionsValue: TravelCVVActionsContextType = {
        setCvv,
        setIsLoading,
        setValidateError,
    };

    return (
        <TravelCVVStateContext.Provider value={stateValue}>
            <TravelCVVActionsContext.Provider value={actionsValue}>{children}</TravelCVVActionsContext.Provider>
        </TravelCVVStateContext.Provider>
    );
}

function useTravelCVVState(): TravelCVVStateContextType {
    return useContext(TravelCVVStateContext);
}

function useTravelCVVActions(): TravelCVVActionsContextType {
    return useContext(TravelCVVActionsContext);
}

export {useTravelCVVState, useTravelCVVActions};
export default TravelCVVContextProvider;
