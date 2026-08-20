import {createContext, useContext} from 'react';

import type HeaderContextValue from './types';

/** Fallback used when a Header block is rendered outside a `<Header>` wrapper — keeps consumers safe from `undefined` reads. */
const defaultHeaderContextValue: HeaderContextValue = {
    shouldUseHeadlineHeader: false,
};

const HeaderContext = createContext<HeaderContextValue>(defaultHeaderContextValue);

function useHeaderContext(): HeaderContextValue {
    return useContext(HeaderContext);
}

export default HeaderContext;
export {useHeaderContext};
export type {default as HeaderContextValue} from './types';
