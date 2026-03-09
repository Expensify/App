// This component is compiled by the React Compiler
/* eslint-disable react/jsx-no-constructed-context-values */
import React, {createContext, useContext, useRef} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {FullScreenActionsContextType, FullScreenStateContextType, ResponsiveLayoutProperties} from './types';

const FullScreenStateContext = createContext<FullScreenStateContextType | null>(null);
const FullScreenActionsContext = createContext<FullScreenActionsContextType | null>(null);

function FullScreenContextProvider({children}: ChildrenProps) {
    const isFullScreenRef = useRef(false);
    const lockedWindowDimensionsRef = useRef<ResponsiveLayoutProperties | null>(null);

    const lockWindowDimensions = (newResponsiveLayoutProperties: ResponsiveLayoutProperties) => {
        lockedWindowDimensionsRef.current = newResponsiveLayoutProperties;
    };

    const unlockWindowDimensions = () => {
        lockedWindowDimensionsRef.current = null;
    };

    const stateValue = {isFullScreenRef, lockedWindowDimensionsRef};
    const actionsValue = {lockWindowDimensions, unlockWindowDimensions};

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
