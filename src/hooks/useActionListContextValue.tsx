import {useRef} from 'react';
import type {ReactNode} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type {ActionListContextType, FlatListRefType, ScrollPosition} from '@pages/inbox/ReportScreenContext';

function useActionListContextValue(): ActionListContextType {
    // Holds the ref of whichever list is currently mounted. Keeping it out of the context value
    // lets React Compiler optimize descendants that attach a ref to JSX `ref={}`.
    const listRefHolder = useRef<FlatListRefType>(null);
    const scrollPositionRef = useRef<ScrollPosition>({});
    const scrollOffsetRef = useRef(0);

    const registerListRef = (ref: FlatListRefType) => {
        listRefHolder.current = ref;
    };
    const getListRef = () => listRefHolder.current;

    return {scrollPositionRef, scrollOffsetRef, registerListRef, getListRef};
}

/** Owns the action-list context value so screens don't wire it up themselves. */
function ActionListContextProvider({children}: {children: ReactNode}) {
    const value = useActionListContextValue();
    return <ActionListContext.Provider value={value}>{children}</ActionListContext.Provider>;
}

export {ActionListContextProvider};
export default useActionListContextValue;
