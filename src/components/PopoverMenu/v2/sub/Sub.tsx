import React, {useId, useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContentActions} from '@components/PopoverMenu/v2/content/ContentContext';
import SubContent from './SubContent';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';
import SubTrigger from './SubTrigger';

type SubProps = {
    children: ReactNode;
    /** Useful for tests/analytics; falls back to a generated id. */
    id?: string;
};

/** Compound holder for one nested submenu level. */
function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackID = useId();
    const subID = id ?? fallbackID;
    const outerSub = useSubContextOptional();
    // Chain only changes via JSX restructure, which would unmount this Sub anyway.
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
Sub.Trigger = SubTrigger;
Sub.Content = SubContent;

export default Sub;
export type {SubProps};
