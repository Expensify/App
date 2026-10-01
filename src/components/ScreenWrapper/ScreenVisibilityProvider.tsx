import type {ReactNode} from 'react';

import React, {useEffect, useLayoutEffect, useState} from 'react';

import type {ScreenVisibilityStore} from './ScreenVisibilityContext';

import ScreenVisibilityContext from './ScreenVisibilityContext';

type ScreenVisibilityProviderProps = {
    isVisible: boolean;
    children: ReactNode;
};

function createScreenVisibilityStore(isInitiallyVisible: boolean): ScreenVisibilityStore & {setIsVisible: (isVisible: boolean) => void} {
    let isVisible = isInitiallyVisible;
    const listeners = new Set<() => void>();
    return {
        getIsVisible: () => isVisible,
        subscribe: (onChange) => {
            listeners.add(onChange);
            return () => {
                listeners.delete(onChange);
            };
        },
        setIsVisible: (nextIsVisible) => {
            if (nextIsVisible === isVisible) {
                return;
            }
            isVisible = nextIsVisible;
            for (const listener of [...listeners]) {
                listener();
            }
        },
    };
}

function ScreenVisibilityProvider({isVisible, children}: ScreenVisibilityProviderProps) {
    const [store] = useState(() => createScreenVisibilityStore(isVisible));

    // Hidden is published before the rows act and visible after, so a row asked to highlight as the screen is covered waits, and one reused as it is uncovered drops its wait first.
    useLayoutEffect(() => {
        if (isVisible) {
            return;
        }
        store.setIsVisible(false);
    }, [store, isVisible]);
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        store.setIsVisible(true);
    }, [store, isVisible]);

    return <ScreenVisibilityContext.Provider value={store}>{children}</ScreenVisibilityContext.Provider>;
}

export default ScreenVisibilityProvider;
