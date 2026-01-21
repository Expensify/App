import React, {useContext, useState} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from './CONST';
import type ChildrenProps from './types/utils/ChildrenProps';

type SplashScreenState = ValueOf<typeof CONST.BOOT_SPLASH_STATE>;

type SplashScreenStateContextType = {
    splashScreenState: SplashScreenState;
};

type SplashScreenActionsContextType = {
    setSplashScreenState: React.Dispatch<React.SetStateAction<SplashScreenState>>;
};

const SplashScreenStateContext = React.createContext<SplashScreenStateContextType>({
    splashScreenState: CONST.BOOT_SPLASH_STATE.VISIBLE,
});

const SplashScreenActionsContext = React.createContext<SplashScreenActionsContextType>({
    setSplashScreenState: () => {},
});

function SplashScreenStateContextProvider({children}: ChildrenProps) {
    const [splashScreenState, setSplashScreenState] = useState<SplashScreenState>(CONST.BOOT_SPLASH_STATE.VISIBLE);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue = {splashScreenState};

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue = {setSplashScreenState};

    return (
        <SplashScreenActionsContext.Provider value={actionsValue}>
            <SplashScreenStateContext.Provider value={stateValue}>{children}</SplashScreenStateContext.Provider>
        </SplashScreenActionsContext.Provider>
    );
}

/**
 * Hook to get the splash screen state.
 * Use this when you need to read the current splash screen state.
 */
function useSplashScreenState() {
    return useContext(SplashScreenStateContext);
}

/**
 * Hook to get splash screen actions.
 * Use this when you only need to update the splash screen state without reading it.
 */
function useSplashScreenActions() {
    return useContext(SplashScreenActionsContext);
}

/**
 * @deprecated Use useSplashScreenState() or useSplashScreenActions() instead for better performance.
 * This hook is kept for backwards compatibility and will cause re-renders on any state change.
 */
function useSplashScreenStateContext() {
    const {splashScreenState} = useSplashScreenState();
    const {setSplashScreenState} = useSplashScreenActions();
    return {splashScreenState, setSplashScreenState};
}

export default SplashScreenStateContext;
export {SplashScreenStateContextProvider, useSplashScreenStateContext, useSplashScreenState, useSplashScreenActions};
