import {createContext, useContext} from 'react';

type ScreenFreezeContextType = {
    /**
     * Register a freeze defer — signals that this component has cleanup work
     * (e.g., keyboard shortcut unsubscribing) that must run before the screen is frozen.
     * When any defers are registered, ScreenFreezeWrapper delays freezing by one frame
     * so cleanup can execute first.
     * Returns an unregister function.
     */
    registerFreezeDefer: () => () => void;
};

const ScreenFreezeContext = createContext<ScreenFreezeContextType>({
    registerFreezeDefer: () => () => {},
});

function useScreenFreezeContext() {
    return useContext(ScreenFreezeContext);
}

export default ScreenFreezeContext;
export {useScreenFreezeContext};
