import React, {useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    id: string;
};

/** Drill-down (one panel + back), not cascading — ancestor `<Sub.Content>` stays mounted while a descendant level is active. */
function Sub({children, id: subID}: SubProps): React.ReactElement {
    const outerSub = useSubContextOptional();
    const parentSubID = outerSub?.subID ?? null;
    const value = {subID, parentSubID} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentSubActions(Sub.displayName);

    // Layout effect: deferring cleanup would briefly anchor the popover at an unmounted Sub.
    useLayoutEffect(() => {
        registerSub(subID);
        return () => unregisterSub(subID);
    }, [subID, registerSub, unregisterSub]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
