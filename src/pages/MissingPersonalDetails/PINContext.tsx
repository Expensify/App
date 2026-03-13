import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

type PINContextType = {
    /** The current PIN value */
    PIN: string;

    /** Set the PIN value */
    setPIN: (PIN: string) => void;

    /** Clear the PIN and reset verification status */
    clearPIN: () => void;

    /** Whether the user is on the PIN confirmation step */
    isConfirmStep: boolean;

    /** Set whether the user is on the PIN confirmation step */
    setIsConfirmStep: (isConfirmStep: boolean) => void;

    /** Whether the PIN input is hidden */
    isPINHidden: boolean;

    /** Toggle PIN visibility */
    togglePINVisibility: () => void;
};

const defaultPINContext: PINContextType = {
    PIN: '',
    setPIN: () => {},
    clearPIN: () => {},
    isConfirmStep: false,
    setIsConfirmStep: () => {},
    isPINHidden: true,
    togglePINVisibility: () => {},
};

const PINContext = createContext<PINContextType>(defaultPINContext);

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

    // Clear PIN when the context provider unmounts (user leaves the flow)
    useEffect(() => {
        return () => {
            clearPIN();
        };
    }, [clearPIN]);

    const value = useMemo(
        () => ({
            PIN,
            setPIN,
            clearPIN,
            isConfirmStep,
            setIsConfirmStep,
            isPINHidden,
            togglePINVisibility,
        }),
        [PIN, clearPIN, isConfirmStep, setIsConfirmStep, isPINHidden, togglePINVisibility],
    );

    return <PINContext.Provider value={value}>{children}</PINContext.Provider>;
}

/**
 * Hook to access the PIN context.
 * Must be used within a PINContextProvider.
 */
function usePIN(): PINContextType {
    return useContext(PINContext);
}

PINContextProvider.displayName = 'PINContextProvider';

export {PINContextProvider, usePIN};
export type {PINContextType};
