import React, {useEffect, useId, useRef} from 'react';
import type {ReactNode} from 'react';
import {useContentActions, useContentState} from './ContentContext';
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
    const parentSubId = outerSub?.subId ?? null;
    const value = {subId, parentSubId} satisfies SubContextValue;

    const {
        state: {currentSubId},
    } = useContentState('PopoverMenu.Sub');
    const {exitSub} = useContentActions('PopoverMenu.Sub');

    // If this Sub unmounts while it's the entered sub, pop to its parent so siblings re-emerge.
    const currentSubIdRef = useRef(currentSubId);
    useEffect(() => {
        currentSubIdRef.current = currentSubId;
    });
    useEffect(
        () => () => {
            if (currentSubIdRef.current !== subId) {
                return;
            }
            exitSub(parentSubId);
        },
        [subId, parentSubId, exitSub],
    );

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
