import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

type PinContextType = {
    /** The current PIN value */
    pin: string;

    /** Set the PIN value */
    setPin: (pin: string) => void;

    /** Clear the PIN and reset verification status */
    clearPin: () => void;
};

const PinContext = createContext<PinContextType | null>(null);

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

    const clearPin = useCallback(() => {
        setPin('');
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
        }),
        [pin, clearPin],
    );

    return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}

/**
 * Hook to access the PIN context.
 * Must be used within a PinContextProvider.
 */
function usePin(): PinContextType {
    const context = useContext(PinContext);
    if (!context) {
        throw new Error('usePin must be used within a PinContextProvider');
    }
    return context;
}

PinContextProvider.displayName = 'PinContextProvider';

export {PinContextProvider, usePin};
export type {PinContextType};
