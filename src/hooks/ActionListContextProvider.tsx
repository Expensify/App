import {useRef} from 'react';
import type {ReactNode} from 'react';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import type {ActionListContextType, FlatListRefType, ScrollPosition} from '@pages/inbox/ReportScreenContext';

/** Owns the action-list context value so screens don't wire it up themselves. */
function ActionListContextProvider({children}: {children: ReactNode}) {
    // Each list owns its own ref locally and publishes it here on mount; only the register/get
    // callbacks live in context, so attaching `ref={}` stays local to each list.
    const listRefHolder = useRef<FlatListRefType>(null);
    const scrollPositionRef = useRef<ScrollPosition>({});
    const scrollOffsetRef = useRef(0);

    const value: ActionListContextType = {
        scrollPositionRef,
        scrollOffsetRef,
        registerListRef: (ref) => {
            listRefHolder.current = ref;
        },
        getListRef: () => listRefHolder.current,
    };

    // The value is only stable refs and ref accessors — none of it triggers re-renders — so a
    // single context is intentional; splitting state/actions into two providers would add ceremony
    // for no benefit.
    // eslint-disable-next-line rulesdir/context-provider-split-values
    return <ActionListContext.Provider value={value}>{children}</ActionListContext.Provider>;
}

export default ActionListContextProvider;
