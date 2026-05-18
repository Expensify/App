import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {defaultPINActionsContextValue, defaultPINStateContextValue} from './default';
import type {PINActionsContextType, PINStateContextType} from './types.context';

const PINStateContext = createContext<PINStateContextType>(defaultPINStateContextValue);
const PINActionsContext = createContext<PINActionsContextType>(defaultPINActionsContextValue);

type PINContextProviderProps = {
    children: ReactNode;
};

/**
 * Context provider for managing PIN state during the card ordering flow.
 * PIN is stored in React Context instead of Onyx for PCI compliance -
 * PINs should never be persisted to storage.
 */
function PINContextProvider({children}: PINContextProviderProps) {
    const [PIN, setPIN] = useState('');
    const [isConfirmStep, setIsConfirmStepInternal] = useState(false);
    const [isPINHidden, setIsPINHidden] = useState(true);

    const setIsConfirmStep = useCallback((value: boolean) => {
        setIsConfirmStepInternal(value);
        setIsPINHidden(true);
    }, []);

    const clearPIN = useCallback(() => {
        setPIN('');
        setIsConfirmStep(false);
    }, [setIsConfirmStep]);

    const togglePINVisibility = useCallback(() => {
        setIsPINHidden((prev) => !prev);
    }, []);

    useEffect(() => {
        return () => {
            clearPIN();
        };
    }, [clearPIN]);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue: PINStateContextType = {
        PIN,
        isConfirmStep,
        isPINHidden,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue: PINActionsContextType = {
        setPIN,
        clearPIN,
        setIsConfirmStep,
        togglePINVisibility,
    };

    return (
        <PINStateContext.Provider value={stateValue}>
            <PINActionsContext.Provider value={actionsValue}>{children}</PINActionsContext.Provider>
        </PINStateContext.Provider>
    );
}

function usePINState(): PINStateContextType {
    return useContext(PINStateContext);
}

function usePINActions(): PINActionsContextType {
    return useContext(PINActionsContext);
}

PINContextProvider.displayName = 'PINContextProvider';

export {PINContextProvider, usePINState, usePINActions};
