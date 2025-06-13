import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import type {ReactElement} from 'react';
import {InteractionManager} from 'react-native';

// A hook that optimizes popover rendering while ensuring proper measurements.
// It uses useLayoutEffect to handle measurements synchronously before paint,
// while still allowing for performance optimizations.

type DeferredComponent<T> = (props: T) => ReactElement | null;

const useDeferredRender = <T extends Record<string, unknown>>(renderFn: DeferredComponent<T>, deps: readonly unknown[]): DeferredComponent<T> => {
    const [isReady, setIsReady] = useState(false);

    // useEffect(() => {
    //     const task = InteractionManager.runAfterInteractions(() => {
    //         setIsReady(true);
    //     });

    //     return () => task.cancel();
    // }, []);

    useLayoutEffect(() => {
        setIsReady(true);
    }, []);

    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedRender = useMemo(() => renderFn, [...deps]);

    return useCallback(
        (props: T) => {
            if (!isReady) {
                return null;
            }

            return memoizedRender(props);
        },
        [memoizedRender, isReady],
    );
};

export default useDeferredRender;
