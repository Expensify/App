import {createContext} from 'react';

type CustomStatusBarAndBackgroundContextType = {
    isRootStatusBarEnabled: boolean;
    setRootStatusBarEnabled: (isEnabled: boolean) => void;
};

const CustomStatusBarAndBackgroundContext = createContext<CustomStatusBarAndBackgroundContextType>({isRootStatusBarEnabled: true, setRootStatusBarEnabled: () => undefined});

export default CustomStatusBarAndBackgroundContext;
export {type CustomStatusBarAndBackgroundContextType};
