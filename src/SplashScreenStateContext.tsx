import React, {useContext, useEffect, useState} from 'react';
import type {ValueOf} from 'type-fest';
import CONFIG from './CONFIG';
import CONST from './CONST';
import {addBootsplashBreadcrumb} from './libs/telemetry/bootsplashTelemetry';
import type ChildrenProps from './types/utils/ChildrenProps';

type SplashScreenState = ValueOf<typeof CONST.BOOT_SPLASH_STATE>;

type SplashScreenStateContextType = {
    splashScreenState: SplashScreenState | undefined;
};

type SplashScreenActionsContextType = {
    setSplashScreenState: (state: SplashScreenState) => void;
};

const SplashScreenStateContext = React.createContext<SplashScreenStateContextType>({
    splashScreenState: undefined,
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
    const [splashScreenState, setSplashScreenStateRaw] = useState<SplashScreenState | undefined>(CONFIG.IS_HYBRID_APP ? undefined : CONST.BOOT_SPLASH_STATE.VISIBLE);

    const setSplashScreenState = (state: SplashScreenState) => {
        addBootsplashBreadcrumb(`splashScreenState changed to ${state}`);
        setSplashScreenStateRaw(state);
    };

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

export {SplashScreenStateContextProvider, useSplashScreenState, useSplashScreenActions};
