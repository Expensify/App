import {createContext} from 'react';

type CustomStatusBarContextType = {
    isRootStatusBarDisabled: boolean;
    disableRootStatusBar: (isDisabled: boolean) => void;
};

const CustomStatusBarContext = createContext<CustomStatusBarContextType>({isRootStatusBarDisabled: false, disableRootStatusBar: () => undefined});

export default CustomStatusBarContext;
export {type CustomStatusBarContextType};
