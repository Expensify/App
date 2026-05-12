import React, {useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import {SubContext, useSubContextOptional} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    id: string;
};

/** One nested submenu level; pairs with `<Sub.Trigger>` + `<Sub.Content>`. */
function Sub({children, id: subID}: SubProps): React.ReactElement {
    const outerSub = useSubContextOptional();
    const parentSubID = outerSub?.subID ?? null;
    const value = {subID, parentSubID} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContentSubActions(Sub.displayName);

    // Layout effect: post-paint cleanup would render a ghost frame pointing at the unmounted Sub.
    useLayoutEffect(() => {
        registerSub(subID);
        return () => unregisterSub(subID);
    }, [subID, registerSub, unregisterSub]);

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
