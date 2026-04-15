// This component is compiled by the React Compiler
/* eslint-disable react/jsx-no-constructed-context-values */
import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {FullScreenActionsContextType, FullScreenStateContextType, ResponsiveLayoutProperties} from './types';

const FullScreenStateContext = createContext<FullScreenStateContextType | null>(null);
const FullScreenActionsContext = createContext<FullScreenActionsContextType | null>(null);

function FullScreenContextProvider({children}: ChildrenProps) {
    const [isFullScreen, setIsFullScreenState] = useState(false);
    const isFullScreenRef = useRef(false);
    const lockedWindowDimensionsRef = useRef<ResponsiveLayoutProperties | null>(null);

    const setIsFullScreen = useCallback((next: boolean) => {
        isFullScreenRef.current = next;
        setIsFullScreenState(next);
    }, []);

    const lockWindowDimensions = (newResponsiveLayoutProperties: ResponsiveLayoutProperties) => {
        lockedWindowDimensionsRef.current = newResponsiveLayoutProperties;
    };

    const unlockWindowDimensions = () => {
        lockedWindowDimensionsRef.current = null;
    };

    const stateValue = {isFullScreen, isFullScreenRef, lockedWindowDimensionsRef};
    const actionsValue = {lockWindowDimensions, unlockWindowDimensions, setIsFullScreen};

    return (
        <FullScreenStateContext.Provider value={stateValue}>
            <FullScreenActionsContext.Provider value={actionsValue}>{children}</FullScreenActionsContext.Provider>
        </FullScreenStateContext.Provider>
    );
}

function useFullScreenState() {
    const value = useContext(FullScreenStateContext);
    if (!value) {
        throw new Error('useFullScreenState must be used within a FullScreenContextProvider');
    }
    return value;
}

function useFullScreenActions() {
    const value = useContext(FullScreenActionsContext);
    if (!value) {
        throw new Error('useFullScreenActions must be used within a FullScreenContextProvider');
    }
    return value;
}

export default FullScreenContextProvider;
export {FullScreenStateContext, FullScreenActionsContext, useFullScreenState, useFullScreenActions};
export type {ResponsiveLayoutProperties, FullScreenStateContextType, FullScreenActionsContextType};
