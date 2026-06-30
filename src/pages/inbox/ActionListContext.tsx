import React, {createContext, useContext, useRef} from 'react';
import type {ReactNode, RefObject} from 'react';
import type FlatListRefType from '@components/FlashList/types';

type ScrollPosition = {offset?: number};

type ActionListContextType = {
    scrollPositionRef: RefObject<ScrollPosition>;
    scrollOffsetRef: RefObject<number>;

    /** Each list publishes its locally-owned ref on mount; pass `null` to clear on unmount. */
    registerListRef: (ref: FlatListRefType) => void;

    /** Reads the currently registered list ref. Call from handlers only, never during render. */
    getListRef: () => FlatListRefType;
};

const ActionListContext = createContext<ActionListContextType>({
    scrollPositionRef: {current: {}},
    scrollOffsetRef: {current: 0},
    registerListRef: () => {},
    getListRef: () => null,
});

function useActionListContext() {
    return useContext(ActionListContext);
}

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

export {ActionListContext, ActionListContextProvider, useActionListContext};
