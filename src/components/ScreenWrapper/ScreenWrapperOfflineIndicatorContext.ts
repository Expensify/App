import {createContext} from 'react';

type ScreenWrapperOfflineIndicatorContextType = {
    showOnSmallScreens?: boolean;
    showOnWideScreens?: boolean;
    addSafeAreaPadding?: boolean;
};

const ScreenWrapperOfflineIndicatorContext = createContext<ScreenWrapperOfflineIndicatorContextType>({
    showOnSmallScreens: true,
    showOnWideScreens: false,
    addSafeAreaPadding: true,
});

export default ScreenWrapperOfflineIndicatorContext;
export type {ScreenWrapperOfflineIndicatorContextType};
