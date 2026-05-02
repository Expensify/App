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

/**
 * Drill-down sub-menu (single panel + back button), not Radix-style cascading panels —
 * deliberate UX choice for touch/small-screen. Don't "fix" this back to multi-panel.
 */

function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackID = useId();
    const subID = id ?? fallbackID;
    const outerSub = useSubContextOptional();
    const ancestorChain = outerSub ? [...outerSub.ancestorChain, outerSub.subID] : [];
    const value = {subID, ancestorChain} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentActions();

    // Mirrored so the unmount cleanup sees the latest chain.
    const ancestorChainRef = useRef<readonly string[]>(ancestorChain);
    useEffect(() => {
        ancestorChainRef.current = ancestorChain;
    });

    useEffect(() => {
        registerSub(subID);
        return () => unregisterSub(subID, ancestorChainRef.current);
    }, [subID, registerSub, unregisterSub]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
