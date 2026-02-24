import type {PropsWithChildren} from 'react';
import {startTransition, use, useLayoutEffect, useState} from 'react';

/**
 * This is a wrapper component that allows us to defer rendering children and do it in the background with the use of startTransition.
 * Caution: To achieve performance benefits from this component you have to wrap it in a Suspense component.
 */
function Deferred({children}: PropsWithChildren) {
    const [{promise, resolve}] = useState(() => Promise.withResolvers<void>());
    const [isMounted, setIsMounted] = useState(false);

    useLayoutEffect(() => {
        setIsMounted(true);

        startTransition(() => {
            resolve();
        });
    }, [resolve]);

    if (!isMounted) {
        // Don't suspend on the first render so the layout effect can run
        return null;
    }

    // Suspend rendering children until the callback resolves. This promise will be caught by the parent Suspense component.
    use(promise);
    return children;
}

export default Deferred;
