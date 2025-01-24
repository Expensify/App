import React, {useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type InputBlurContextType = {
    isBlurred: boolean; // Boolean state to track blur
    setIsBlurred: React.Dispatch<React.SetStateAction<boolean>>; // Function to update the state
};

const InputBlurContext = React.createContext<InputBlurContextType>({
    isBlurred: true,
    setIsBlurred: () => {},
});

function InputBlurContextProvider({children}: ChildrenProps) {
    const [isBlurred, setIsBlurred] = useState<boolean>(false);

    const contextValue = useMemo(
        () => ({
            isBlurred,
            setIsBlurred,
        }),
        [isBlurred],
    );

    return <InputBlurContext.Provider value={contextValue}>{children}</InputBlurContext.Provider>;
}

function useInputBlurContext() {
    return useContext(InputBlurContext);
}

export {InputBlurContext, useInputBlurContext, InputBlurContextProvider};
