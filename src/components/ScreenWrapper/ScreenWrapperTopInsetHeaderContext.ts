import {createContext} from 'react';

type ScreenWrapperTopInsetHeaderContextType = {
    /** Whether the screen left the top inset out of its padding because a header placed itself in the inset */
    isHeaderInTopInset: boolean;

    /** Lets a header place itself in the top inset; the returned function undoes it */
    registerTopInsetHeader: () => () => void;
};

/**
 * Lets a screen's header take over the top inset from its ScreenWrapper, for devices whose status bar leaves room for a
 * header next to it inside the top inset (see `useStatusRingHeaderLayout`).
 */
const ScreenWrapperTopInsetHeaderContext = createContext<ScreenWrapperTopInsetHeaderContextType | undefined>(undefined);

export type {ScreenWrapperTopInsetHeaderContextType};
export default ScreenWrapperTopInsetHeaderContext;
