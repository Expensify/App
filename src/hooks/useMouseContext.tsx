import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo, useState} from 'react';

type MouseContextProps = {
    isMouseDownOnInput: boolean;
    setMouseDown: () => void;
    setMouseUp: () => void;
};

// Create a context with default values and handlers
const MouseContext = createContext<MouseContextProps>({
    isMouseDownOnInput: false,
    setMouseDown: () => {},
    setMouseUp: () => {},
});

type MouseProviderProps = {
    children: ReactNode;
};

// Context provider component
function MouseProvider({children}: MouseProviderProps) {
    const [isMouseDownOnInput, setIsMouseDownOnInput] = useState(false);

    const setMouseDown = () => setIsMouseDownOnInput(true);
    const setMouseUp = () => setIsMouseDownOnInput(false);

    const value = useMemo(() => ({isMouseDownOnInput, setMouseDown, setMouseUp}), [isMouseDownOnInput]);

    return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>;
}

// Custom hook to use the mouse context
const useMouseContext = () => useContext(MouseContext);

export {MouseProvider, useMouseContext};
