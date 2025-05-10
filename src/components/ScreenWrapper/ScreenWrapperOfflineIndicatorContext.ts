import {createContext} from 'react';

type ScreenWrapperOfflineIndicatorBaseContext = {
    showOnSmallScreens?: boolean;
    showOnWideScreens?: boolean;
    addSafeAreaPadding?: boolean;
};

type ScreenWrapperOfflineIndicatorContextType = {
    showOnSmallScreens?: boolean;
    showOnWideScreens?: boolean;
    addSafeAreaPadding?: boolean;
    originalValues?: ScreenWrapperOfflineIndicatorBaseContext;
};

const ScreenWrapperOfflineIndicatorContext = createContext<ScreenWrapperOfflineIndicatorContextType>({});

export default ScreenWrapperOfflineIndicatorContext;
export type {ScreenWrapperOfflineIndicatorContextType};
