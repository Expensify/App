import type {ReactNode} from 'react';

import React, {useEffect, useState} from 'react';

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

    // A passive effect, so a row recycled in this commit drops its wait before the screen is published as visible.
    useEffect(() => {
        store.setIsVisible(isVisible);
    }, [store, isVisible]);

    return <ScreenVisibilityContext.Provider value={store}>{children}</ScreenVisibilityContext.Provider>;
}

export default ScreenVisibilityProvider;
