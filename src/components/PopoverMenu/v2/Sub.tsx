import React, {useEffect, useId, useRef} from 'react';
import type {ReactNode} from 'react';
import {useContentActions} from './ContentContext';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    /** Override the auto-generated id. Useful for tests/analytics. */
    id?: string;
};

function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackId = useId();
    const subId = id ?? fallbackId;
    const outerSub = useSubContextOptional();
    const ancestorChain = outerSub ? [...outerSub.ancestorChain, outerSub.subId] : [];
    const value = {subId, ancestorChain} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentActions();

    // Mirrored so the unmount cleanup sees the latest chain.
    const ancestorChainRef = useRef<readonly string[]>(ancestorChain);
    useEffect(() => {
        ancestorChainRef.current = ancestorChain;
    });

    useEffect(() => {
        registerSub(subId);
        return () => unregisterSub(subId, ancestorChainRef.current);
    }, [subId, registerSub, unregisterSub]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
