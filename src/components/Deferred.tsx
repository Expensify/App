import type {PropsWithChildren} from 'react';
import {startTransition, use, useLayoutEffect, useState} from 'react';

/**
 * This is a wrapper component that allows us to defer rendering children and do it in the background with the use of startTransition.
 */
function Deferred({children}: PropsWithChildren) {
    const [{promise, resolve}] = useState(() => {
        let resolver!: () => void;
        const p = new Promise<void>((r) => {
            resolver = r;
        });
        return {promise: p, resolve: resolver};
    });
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

    // Suspend rendering children until the callback resolves. To achieve deferring we have to wrap Deferred component with Suspense that will catch this use(promise)
    use(promise);
    return children;
}

Deferred.displayName = 'Deferred';

export default Deferred;
