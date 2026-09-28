import {createContext, useContext} from 'react';

type HeaderContextValue = {
    shouldSkipFocusAfterTransition: boolean;
};

const HeaderContext = createContext<HeaderContextValue>({shouldSkipFocusAfterTransition: false});

function useHeaderContext(): HeaderContextValue {
    return useContext(HeaderContext);
}

export default HeaderContext;
export {useHeaderContext};
export type {HeaderContextValue};
