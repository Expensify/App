import React, {createContext, useContext} from 'react';
import type {ViewStyle} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';

type ScreenWrapperChildrenProps = {
    insets: EdgeInsets;
    safeAreaPaddingBottomStyle?: {
        paddingBottom?: ViewStyle['paddingBottom'];
    };
    didScreenTransitionEnd: boolean;
};

type ScreenWrapperInsetsContextType = ScreenWrapperChildrenProps;

const ScreenWrapperInsetsContext = createContext<ScreenWrapperInsetsContextType | undefined>(undefined);

type ScreenWrapperInsetsProviderProps = {
    value: ScreenWrapperInsetsContextType;
    children: React.ReactNode;
};

function ScreenWrapperInsetsProvider({value, children}: ScreenWrapperInsetsProviderProps) {
    return <ScreenWrapperInsetsContext.Provider value={value}>{children}</ScreenWrapperInsetsContext.Provider>;
}

function useScreenWrapper(): ScreenWrapperInsetsContextType {
    const context = useContext(ScreenWrapperInsetsContext);
    if (!context) {
        throw new Error('useScreenWrapper must be used within a ScreenWrapperInsetsProvider');
    }
    return context;
}

export {ScreenWrapperInsetsProvider, useScreenWrapper};
export type {ScreenWrapperInsetsContextType, ScreenWrapperChildrenProps, ScreenWrapperInsetsProviderProps};
