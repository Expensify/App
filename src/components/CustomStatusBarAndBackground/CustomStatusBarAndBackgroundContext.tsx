import React, {createContext, useContext} from 'react';
import {defaultCustomStatusBarAndBackgroundActionsContextValue, defaultCustomStatusBarAndBackgroundStateContextValue} from './default';
import type {CustomStatusBarAndBackgroundActionsContextType, CustomStatusBarAndBackgroundStateContextType} from './types';

const CustomStatusBarAndBackgroundStateContext = createContext<CustomStatusBarAndBackgroundStateContextType>(defaultCustomStatusBarAndBackgroundStateContextValue);
const CustomStatusBarAndBackgroundActionsContext = createContext<CustomStatusBarAndBackgroundActionsContextType>(defaultCustomStatusBarAndBackgroundActionsContextValue);

type CustomStatusBarAndBackgroundProviderProps = {
    state: CustomStatusBarAndBackgroundStateContextType;
    actions: CustomStatusBarAndBackgroundActionsContextType;
    children: React.ReactNode;
};

function CustomStatusBarAndBackgroundProvider({state, actions, children}: CustomStatusBarAndBackgroundProviderProps) {
    return (
        <CustomStatusBarAndBackgroundStateContext.Provider value={state}>
            <CustomStatusBarAndBackgroundActionsContext.Provider value={actions}>{children}</CustomStatusBarAndBackgroundActionsContext.Provider>
        </CustomStatusBarAndBackgroundStateContext.Provider>
    );
}

function useCustomStatusBarAndBackgroundState(): CustomStatusBarAndBackgroundStateContextType {
    return useContext(CustomStatusBarAndBackgroundStateContext);
}

function useCustomStatusBarAndBackgroundActions(): CustomStatusBarAndBackgroundActionsContextType {
    return useContext(CustomStatusBarAndBackgroundActionsContext);
}

export {
    CustomStatusBarAndBackgroundActionsContext,
    CustomStatusBarAndBackgroundProvider,
    CustomStatusBarAndBackgroundStateContext,
    useCustomStatusBarAndBackgroundActions,
    useCustomStatusBarAndBackgroundState,
};
