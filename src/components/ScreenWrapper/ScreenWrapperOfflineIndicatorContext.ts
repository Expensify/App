import {createContext} from 'react';

type ScreenWrapperOfflineIndicatorBaseContext = {
    isInNarrowPane?: boolean;
    showOnSmallScreens?: boolean;
    showOnWideScreens?: boolean;
    addSafeAreaPadding?: boolean;
};

type ScreenWrapperOfflineIndicatorContextType = {
    isInNarrowPane?: boolean;
    showOnSmallScreens?: boolean;
    showOnWideScreens?: boolean;
    addSafeAreaPadding?: boolean;
    originalValues?: ScreenWrapperOfflineIndicatorBaseContext;
};

const ScreenWrapperOfflineIndicatorContext = createContext<ScreenWrapperOfflineIndicatorContextType>({});

export default ScreenWrapperOfflineIndicatorContext;
export type {ScreenWrapperOfflineIndicatorContextType};
