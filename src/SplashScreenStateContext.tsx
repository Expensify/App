import React, {useContext, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from './CONST';
import type ChildrenProps from './types/utils/ChildrenProps';

type SplashScreenStateContextType = {
    splashScreenState: ValueOf<typeof CONST.BOOT_SPLASH_STATE>;
    setSplashScreenState: React.Dispatch<React.SetStateAction<ValueOf<typeof CONST.BOOT_SPLASH_STATE>>>;
};

const SplashScreenStateContext = React.createContext<SplashScreenStateContextType>({
    splashScreenState: CONST.BOOT_SPLASH_STATE.VISIBLE,
    setSplashScreenState: () => {},
});

function SplashScreenStateContextProvider({children}: ChildrenProps) {
    const [splashScreenState, setSplashScreenState] = useState<ValueOf<typeof CONST.BOOT_SPLASH_STATE>>(CONST.BOOT_SPLASH_STATE.VISIBLE);
    const splashScreenStateContext = useMemo(
        () => ({
            splashScreenState,
            setSplashScreenState,
        }),
        [splashScreenState],
    );

    return <SplashScreenStateContext.Provider value={splashScreenStateContext}>{children}</SplashScreenStateContext.Provider>;
}

function useSplashScreenStateContext() {
    return useContext(SplashScreenStateContext);
}

export default SplashScreenStateContext;
export {SplashScreenStateContextProvider, useSplashScreenStateContext};
