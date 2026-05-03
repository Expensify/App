import React, {useId, useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContentActions} from '@components/PopoverMenu/v2/content/ContentContext';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    /** Useful for tests/analytics; falls back to a generated id. */
    id?: string;
};

/** Wraps `<SubTrigger>` and `<SubContent>` for one nested submenu level. */
function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackID = useId();
    const subID = id ?? fallbackID;
    const outerSub = useSubContextOptional();
    // Chain changes only via JSX restructure (which unmounts this Sub).
    const ancestorChain: readonly string[] = outerSub ? [...outerSub.ancestorChain, outerSub.subID] : [];
    const value = {subID, ancestorChain} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentActions(Sub.displayName);

    // Layout effect: post-paint cleanup would render a ghost frame pointing at the unmounted Sub.
    useLayoutEffect(() => {
        registerSub(subID);
        return () => unregisterSub(subID, ancestorChain);
    }, [subID, registerSub, unregisterSub, ancestorChain]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
