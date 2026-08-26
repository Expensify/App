import React, {useContext} from 'react';

import type {PopoverContextProps} from './types';

type PopoverStateContextType = {
    isOpen: boolean;
    popover: null;
    popoverAnchor: null;
};

type PopoverActionsContextType = {
    onOpen: (...args: unknown[]) => void;
    close: (...args: unknown[]) => void;
    setActivePopoverExtraAnchorRef: (...args: unknown[]) => void;
};

const defaultPopoverActionsContext: PopoverActionsContextType = {
    onOpen: () => {},
    close: () => {},
    setActivePopoverExtraAnchorRef: () => {},
};

const PopoverStateContext = React.createContext<PopoverStateContextType>({
    isOpen: false,
    popover: null,
    popoverAnchor: null,
});

const PopoverActionsContext = React.createContext<PopoverActionsContextType>(defaultPopoverActionsContext);

function PopoverContextProvider(props: PopoverContextProps) {
    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue: PopoverActionsContextType = {
        onOpen: (..._args: unknown[]) => {},
        close: (..._args: unknown[]) => {},
        setActivePopoverExtraAnchorRef: (..._args: unknown[]) => {},
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateContextValue: PopoverStateContextType = {
        isOpen: false,
        popover: null,
        popoverAnchor: null,
    };

    return (
        <PopoverStateContext.Provider value={stateContextValue}>
            <PopoverActionsContext.Provider value={actionsContextValue}>{props.children}</PopoverActionsContext.Provider>
        </PopoverStateContext.Provider>
    );
}

function usePopoverState() {
    return useContext(PopoverStateContext);
}

function usePopoverActions() {
    return useContext(PopoverActionsContext);
}

export default PopoverContextProvider;

export {usePopoverState, usePopoverActions};
