import React, {useId, useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    /** Useful for tests/analytics; falls back to a generated id. */
    id?: string;
};

/** One nested submenu level; pairs with `<Sub.Trigger>` + `<Sub.Content>`. */
function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackID = useId();
    const subID = id ?? fallbackID;
    const outerSub = useSubContextOptional();
    const parentSubID = outerSub?.subID ?? null;
    const value = {subID, parentSubID} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentSubActions(Sub.displayName);

    // Layout effect: post-paint cleanup would render a ghost frame pointing at the unmounted Sub.
    useLayoutEffect(() => {
        registerSub(subID, parentSubID);
        return () => unregisterSub(subID);
    }, [subID, parentSubID, registerSub, unregisterSub]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
