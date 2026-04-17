import {useRef} from 'react';
import type {RefObject} from 'react';
import type {ActionListContextType, ScrollPosition} from '@pages/inbox/ReportScreenContext';

function useActionListContextValue(): ActionListContextType {
    // Private holder — the registered list ref from whichever child list is currently mounted.
    // Owning the ref here (instead of exposing a RefObject through context) lets React Compiler
    // optimize descendants that previously had to pass a context-owned ref to JSX `ref={}`.
    const listRefHolder = useRef<RefObject<unknown> | null>(null);
    const scrollPositionRef = useRef<ScrollPosition>({});
    const scrollOffsetRef = useRef(0);

    const registerListRef = (ref: RefObject<unknown> | null) => {
        listRefHolder.current = ref;
    };
    // Caller-side types vary (FlashListRef | FlatList). We expose the duck-typed imperative
    // interface here so scroll handlers can invoke scrollTo* without per-caller casts.
    const getListRef: ActionListContextType['getListRef'] = () => listRefHolder.current as ReturnType<ActionListContextType['getListRef']>;

    return {registerListRef, getListRef, scrollPositionRef, scrollOffsetRef};
}

export default useActionListContextValue;
