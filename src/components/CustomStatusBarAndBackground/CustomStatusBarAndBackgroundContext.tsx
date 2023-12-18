import {createContext} from 'react';

type CustomStatusBarAndBackgroundContextType = {
    isRootStatusBarDisabled: boolean;
    disableRootStatusBar: (isDisabled: boolean) => void;
};

const CustomStatusBarAndBackgroundContext = createContext<CustomStatusBarAndBackgroundContextType>({isRootStatusBarDisabled: false, disableRootStatusBar: () => undefined});

export default CustomStatusBarAndBackgroundContext;
export {type CustomStatusBarAndBackgroundContextType};
