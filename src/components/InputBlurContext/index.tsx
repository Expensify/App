import React, {useContext, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type InputBlurStateContextType = {
    isBlurred: boolean;
};

type InputBlurActionsContextType = {
    setIsBlurred: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultInputBlurActionsContext: InputBlurActionsContextType = {
    setIsBlurred: () => {},
};

const InputBlurStateContext = React.createContext<InputBlurStateContextType>({
    isBlurred: true,
});

const InputBlurActionsContext = React.createContext<InputBlurActionsContextType>(defaultInputBlurActionsContext);

function InputBlurContextProvider({children}: ChildrenProps) {
    const [isBlurred, setIsBlurred] = useState<boolean>(false);

    const actionsContextValue = {
        setIsBlurred,
    };

    const stateContextValue = {isBlurred};

    return (
        <InputBlurActionsContext.Provider value={actionsContextValue}>
            <InputBlurStateContext.Provider value={stateContextValue}>{children}</InputBlurStateContext.Provider>
        </InputBlurActionsContext.Provider>
    );
}

function useInputBlurState() {
    return useContext(InputBlurStateContext);
}

function useInputBlurActions() {
    return useContext(InputBlurActionsContext);
}

export {InputBlurContextProvider, useInputBlurState, useInputBlurActions};
