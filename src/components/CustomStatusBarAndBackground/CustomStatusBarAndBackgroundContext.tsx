import {createContext} from 'react';

type CustomStatusBarAndBackgroundContextType = {
    isRootStatusBarEnabled: boolean;
    setRootStatusBarEnabled: (isEnabled: boolean) => void;
};

// Signin page has its separate Statusbar and ThemeProvider, so when user is on the SignInPage we need to disable the root statusbar so there is no double status bar in component stack, first in Root and other in SignInPage
const CustomStatusBarAndBackgroundContext = createContext<CustomStatusBarAndBackgroundContextType>({isRootStatusBarEnabled: true, setRootStatusBarEnabled: () => undefined});

export default CustomStatusBarAndBackgroundContext;
export {type CustomStatusBarAndBackgroundContextType};
