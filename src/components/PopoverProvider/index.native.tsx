import React from 'react';
import {PopoverContextProps, PopoverContextValue} from './types';

const PopoverContext = React.createContext<PopoverContextValue>({
    onOpen: () => {},
    popover: {},
    close: () => {},
    isOpen: false,
});

function PopoverContextProvider(props: PopoverContextProps) {
    const contextValue = React.useMemo(
        () => ({
            onOpen: () => {},
            close: () => {},
            popover: {},
            isOpen: false,
        }),
        [],
    );

    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}

PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
