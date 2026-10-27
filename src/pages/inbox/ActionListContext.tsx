import type FlatListRefType from '@components/FlashList/types';

import {isMobilePhoneWeb} from '@libs/isInLandscapeMode';

import createDummySharedValue from '@src/utils/createDummySharedValue';

import type {ReactNode, RefObject} from 'react';
import type {FlatList} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import React, {createContext, useContext, useLayoutEffect, useRef} from 'react';
import {useSharedValue} from 'react-native-reanimated';

type ScrollMetrics = {
    offset: number;
    distanceToOldestEnd: number;
    distanceToNewestEnd: number;
    viewportHeight: number;
};

const INITIAL_SCROLL_METRICS: ScrollMetrics = {offset: 0, distanceToOldestEnd: 0, distanceToNewestEnd: 0, viewportHeight: 0};

type ActionListContextType = {
    scrollOffsetRef: RefObject<number>;

    /**
     * The list's scroll state for worklets. `offset` grows toward the oldest message; the distances to either end go
     * negative while the list overscrolls past it.
     */
    scrollMetricsSV: SharedValue<ScrollMetrics>;

    /**
     * Updates `scrollMetricsSV`. No-op outside mobile phone web, where it's used. Kept current in portrait too so
     * returning to landscape doesn't anchor to a stale offset.
     */
    syncScrollSharedValues: (metrics: ScrollMetrics) => void;

    /** Height the collapsed report header has handed over to the list, 0 while expanded. */
    collapsedHeaderHeightSV: SharedValue<number>;

    /** Snapshot of the persisted scroll offset. Safe to call during render (e.g. a useState initializer) to restore mount-time scroll state. */
    getScrollOffset: () => number;

    /** Each list publishes its locally-owned ref on mount; pass `null` to clear on unmount. */
    registerListRef: (ref: FlatListRefType) => void;

    /** Reads the currently registered list ref. Call from handlers only, never during render. */
    getListRef: () => FlatListRefType;
};

const ActionListContext = createContext<ActionListContextType>({
    scrollOffsetRef: {current: 0},
    scrollMetricsSV: createDummySharedValue(INITIAL_SCROLL_METRICS),
    syncScrollSharedValues: () => {},
    collapsedHeaderHeightSV: createDummySharedValue(0),
    getScrollOffset: () => 0,
    registerListRef: () => {},
    getListRef: () => null,
});

function useActionListContext() {
    return useContext(ActionListContext);
}

/**
 * Owns a list ref and publishes it to the context (cleared on unmount). Layout effect so it's registered
 * at commit, before any layout-time handler reads it via `getListRef()`. Returns the ref to attach.
 */
function useActionListRef() {
    const {registerListRef} = useActionListContext();
    const listRef = useRef<FlatList>(null);

    useLayoutEffect(() => {
        registerListRef(listRef);
        return () => registerListRef(null);
    }, [registerListRef]);

    return listRef;
}

/** Owns the action-list context value so screens don't wire it up themselves. */
function ActionListContextProvider({children}: {children: ReactNode}) {
    // Each list owns its own ref locally and publishes it here on mount; only the register/get
    // callbacks live in context, so attaching `ref={}` stays local to each list.
    const listRefHolder = useRef<FlatListRefType>(null);
    const scrollOffsetRef = useRef(0);
    const scrollMetricsSV = useSharedValue(INITIAL_SCROLL_METRICS);
    const collapsedHeaderHeightSV = useSharedValue(0);

    const value: ActionListContextType = {
        scrollOffsetRef,
        scrollMetricsSV,
        syncScrollSharedValues: (metrics) => {
            if (!isMobilePhoneWeb) {
                return;
            }
            scrollMetricsSV.set(metrics);
        },
        collapsedHeaderHeightSV,
        getScrollOffset: () => scrollOffsetRef.current,
        registerListRef: (ref) => {
            listRefHolder.current = ref;
        },
        getListRef: () => listRefHolder.current,
    };

    // The value is only stable refs, shared values and their accessors — none of it triggers re-renders — so a
    // single context is intentional; splitting state/actions into two providers would add ceremony
    // for no benefit.
    // eslint-disable-next-line rulesdir/context-provider-split-values
    return <ActionListContext.Provider value={value}>{children}</ActionListContext.Provider>;
}

export {ActionListContext, ActionListContextProvider, useActionListContext, useActionListRef};
