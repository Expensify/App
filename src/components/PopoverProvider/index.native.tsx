import React from 'react';
import type {PopoverContextProps, PopoverContextValue} from './types';

const PopoverContext = React.createContext<PopoverContextValue>({
    onOpen: () => {},
    popover: null,
    close: () => {},
    isOpen: false,
    setActivePopoverExtraAnchorRef: () => {},
});

function PopoverContextProvider(props: PopoverContextProps) {
    const contextValue = React.useMemo(
        () => ({
            onOpen: () => {},
            close: () => {},
            popover: null,
            isOpen: false,
            setActivePopoverExtraAnchorRef: () => {},
        }),
        [],
    );

    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}

export default PopoverContextProvider;

export {PopoverContext};
