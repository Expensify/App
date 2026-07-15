import {createContext} from 'react';

type ScreenWrapperStatusContextType = {
    didScreenTransitionEnd: boolean;
    shouldUseNarrowLayout: boolean;
    isSafeAreaTopPaddingApplied: boolean;
    isSafeAreaBottomPaddingApplied: boolean;
};

const ScreenWrapperStatusContext = createContext<ScreenWrapperStatusContextType | undefined>(undefined);

export default ScreenWrapperStatusContext;
