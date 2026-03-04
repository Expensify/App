import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

type PinContextType = {
    /** The current PIN value */
    pin: string;

    /** Set the PIN value */
    setPin: (pin: string) => void;

    /** Clear the PIN and reset verification status */
    clearPin: () => void;

    /** Whether the user is on the PIN confirmation step */
    isConfirmStep: boolean;

    /** Set whether the user is on the PIN confirmation step */
    setIsConfirmStep: (isConfirmStep: boolean) => void;

    /** Whether the PIN input is hidden */
    isPinHidden: boolean;

    /** Toggle PIN visibility */
    togglePinVisibility: () => void;
};

const defaultPinContext: PinContextType = {
    pin: '',
    setPin: () => {},
    clearPin: () => {},
    isConfirmStep: false,
    setIsConfirmStep: () => {},
    isPinHidden: true,
    togglePinVisibility: () => {},
};

const PinContext = createContext<PinContextType>(defaultPinContext);

type PinContextProviderProps = {
    children: ReactNode;
};

/**
 * Context provider for managing PIN state during the card ordering flow.
 * PIN is stored in React Context instead of Onyx for PCI compliance -
 * PINs should never be persisted to storage.
 */
function PinContextProvider({children}: PinContextProviderProps) {
    const [pin, setPin] = useState('');
    const [isConfirmStep, setIsConfirmStepInternal] = useState(false);
    const [isPinHidden, setIsPinHidden] = useState(true);

    const setIsConfirmStep = useCallback((value: boolean) => {
        setIsConfirmStepInternal(value);
        setIsPinHidden(true);
    }, []);

    const clearPin = useCallback(() => {
        setPin('');
        setIsConfirmStep(false);
    }, [setIsConfirmStep]);

    const togglePinVisibility = useCallback(() => {
        setIsPinHidden((prev) => !prev);
    }, []);

    // Clear PIN when the context provider unmounts (user leaves the flow)
    useEffect(() => {
        return () => {
            clearPin();
        };
    }, [clearPin]);

    const value = useMemo(
        () => ({
            pin,
            setPin,
            clearPin,
            isConfirmStep,
            setIsConfirmStep,
            isPinHidden,
            togglePinVisibility,
        }),
        [pin, clearPin, isConfirmStep, setIsConfirmStep, isPinHidden, togglePinVisibility],
    );

    return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}

/**
 * Hook to access the PIN context.
 * Must be used within a PinContextProvider.
 */
function usePin(): PinContextType {
    return useContext(PinContext);
}

PinContextProvider.displayName = 'PinContextProvider';

export {PinContextProvider, usePin};
export type {PinContextType};
