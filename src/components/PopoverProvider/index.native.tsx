import React from 'react';
import {PopoverContextProps, PopoverContextValue} from './types';

const PopoverContext = React.createContext<PopoverContextValue>({
    onOpen: () => {},
    popover: null,
    close: () => {},
    isOpen: false,
});

function PopoverContextProvider(props: PopoverContextProps) {
    return (
        <PopoverContext.Provider
            value={{
                onOpen: () => {},
                close: () => {},
                popover: null,
                isOpen: false,
            }}
        >
            {props.children}
        </PopoverContext.Provider>
    );
}

PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
