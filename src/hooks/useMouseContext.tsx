import React, {createContext, useContext, useState} from 'react';

// Create a context with default values and handlers
const MouseContext = createContext({
    isMouseDownOnInput: false,
    setMouseDown: () => {},
    setMouseUp: () => {},
});

// Context provider component
export const MouseProvider = ({children}) => {
    const [isMouseDownOnInput, setIsMouseDownOnInput] = useState(false);

    const setMouseDown = () => setIsMouseDownOnInput(true);
    const setMouseUp = () => setIsMouseDownOnInput(false);

    return <MouseContext.Provider value={{isMouseDownOnInput, setMouseDown, setMouseUp}}>{children}</MouseContext.Provider>;
};

// Custom hook to use the mouse context
export const useMouseContext = () => useContext(MouseContext);
