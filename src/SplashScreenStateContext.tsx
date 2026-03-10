import React, {useContext, useEffect, useState} from 'react';
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

function loadPostSplashScreenModules() {
    import('./libs/actions/replaceOptimisticReportWithActualReport');
    import('./libs/registerPaginationConfig');
    import('./libs/UnreadIndicatorUpdater');
}

function SplashScreenStateContextProvider({children}: ChildrenProps) {
    const [splashScreenState, setSplashScreenState] = useState<SplashScreenState>(CONST.BOOT_SPLASH_STATE.VISIBLE);

    // Load post-splash-screen modules when the splash screen is hidden
    useEffect(() => {
        if (splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN) {
            return;
        }
        loadPostSplashScreenModules();
    }, [splashScreenState]);

    // Because of the React Compiler we don't need to memoize these context values manually
    const stateValue = {splashScreenState};
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

export default SplashScreenStateContext;
export {SplashScreenStateContextProvider, useSplashScreenState, useSplashScreenActions};
