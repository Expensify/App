import React, {useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import {SubContext, useSubContextOptional} from './context';
import type {SubContextValue} from './context';

type SubProps = {
    children: ReactNode;
    id: string;
};

function Sub({children, id: subID}: SubProps): React.ReactElement {
    const outerSub = useSubContextOptional();
    const parentSubID = outerSub?.subID ?? null;
    const level = outerSub ? outerSub.level + 1 : 0;
    const value = {subID, parentSubID, level} satisfies SubContextValue;

    const {registerSub, unregisterSub} = useContent(Sub.displayName).actions;

    useLayoutEffect(() => {
        registerSub(subID);
        return () => unregisterSub(subID);
    }, [subID, registerSub, unregisterSub]);

    return <SubContext value={value}>{children}</SubContext>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
