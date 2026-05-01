import React, {useEffect, useId, useRef} from 'react';
import type {ReactNode} from 'react';
import {useContentActions, useContentState} from './ContentContext';
import {SubContext} from './SubContext';
import type {SubContextValue} from './SubContext';

type SubProps = {
    children: ReactNode;
    /** Override the auto-generated sub id. Useful for tests and analytics. */
    id?: string;
};

function Sub({children, id}: SubProps): React.ReactElement {
    const fallbackId = useId();
    const subId = id ?? fallbackId;
    const value = {subId} satisfies SubContextValue;

    const {
        state: {currentSubId},
    } = useContentState('PopoverMenu.Sub');
    const {exitSub} = useContentActions('PopoverMenu.Sub');

    // If this `<Sub>` unmounts while it's the entered sub, clear the orphaned id so siblings re-emerge.
    const currentSubIdRef = useRef(currentSubId);
    useEffect(() => {
        currentSubIdRef.current = currentSubId;
    });
    useEffect(
        () => () => {
            if (currentSubIdRef.current !== subId) {
                return;
            }
            exitSub();
        },
        [subId, exitSub],
    );

    return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

Sub.displayName = 'PopoverMenu.Sub';

export default Sub;
export type {SubProps};
