import type {ReactNode} from 'react';
import React, {createContext, useContext, useState} from 'react';

type MouseStateContextProps = {
    isMouseDownOnInput: boolean;
};

type MouseActionsContextProps = {
    setMouseDown: () => void;
    setMouseUp: () => void;
};

const MouseStateContext = createContext<MouseStateContextProps>({
    isMouseDownOnInput: false,
});

const MouseActionsContext = createContext<MouseActionsContextProps>({
    setMouseDown: () => {},
    setMouseUp: () => {},
});

type MouseProviderProps = {
    children: ReactNode;
};

function MouseProvider({children}: MouseProviderProps) {
    const [isMouseDownOnInput, setIsMouseDownOnInput] = useState(false);

    const setMouseDown = () => setIsMouseDownOnInput(true);
    const setMouseUp = () => setIsMouseDownOnInput(false);

    const stateValue = {isMouseDownOnInput};
    const actionsValue = {setMouseDown, setMouseUp};

    return (
        <MouseStateContext.Provider value={stateValue}>
            <MouseActionsContext.Provider value={actionsValue}>{children}</MouseActionsContext.Provider>
        </MouseStateContext.Provider>
    );
}

const useMouseState = () => useContext(MouseStateContext);

const useMouseActions = () => useContext(MouseActionsContext);

const useMouseContext = () => {
    const state = useMouseState();
    const actions = useMouseActions();
    return {...state, ...actions};
};

export {MouseProvider, useMouseContext, useMouseState, useMouseActions};
