import {createContext} from 'react';

type ScreenWrapperTopInsetHeaderContextType = {
    /** The header placed in the top inset, which the screen left out of its padding: the first header that asked for it */
    topInsetHeaderID: string | undefined;

    /** Lets a header ask to place itself in the top inset; the returned function withdraws the request */
    registerTopInsetHeader: (headerID: string) => () => void;
};

/**
 * Lets a screen's header take over the top inset from its ScreenWrapper, for devices whose status bar leaves room for a
 * header next to it inside the top inset (see `useStatusRingHeaderLayout`).
 */
const ScreenWrapperTopInsetHeaderContext = createContext<ScreenWrapperTopInsetHeaderContextType | undefined>(undefined);

export type {ScreenWrapperTopInsetHeaderContextType};
export default ScreenWrapperTopInsetHeaderContext;
