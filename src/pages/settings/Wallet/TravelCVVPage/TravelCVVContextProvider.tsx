import type {PropsWithChildren} from 'react';
import React, {createContext, useContext, useState} from 'react';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type TravelCVVContextType from './types';

const defaultContext: TravelCVVContextType = {
    cvv: null,
    isLoading: false,
    validateError: {},
    setCvv: () => {},
    setIsLoading: () => {},
    setValidateError: () => {},
};

const TravelCVVContext = createContext<TravelCVVContextType>(defaultContext);

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
    const contextValue: TravelCVVContextType = {
        cvv,
        isLoading,
        validateError,
        setCvv,
        setIsLoading,
        setValidateError,
    };

    return <TravelCVVContext.Provider value={contextValue}>{children}</TravelCVVContext.Provider>;
}

function useTravelCVV(): TravelCVVContextType {
    return useContext(TravelCVVContext);
}

export {useTravelCVV};
export default TravelCVVContextProvider;
