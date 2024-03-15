import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {FullScreenContext} from './types';

const Context = React.createContext<FullScreenContext | null>(null);

function FullScreenContextProvider({children}: ChildrenProps) {
    const isFullscreen = useRef(false);
    const lockedWindowDimensions = useRef<WindowDimensions | null>(null);

    const lockWindowDimensions = useCallback((newWindowDimensions: WindowDimensions) => {
        lockedWindowDimensions.current = newWindowDimensions;
    }, []);

    const unlockWindowDimensions = useCallback(() => {
        lockedWindowDimensions.current = null;
    }, []);

    const contextValue = useMemo(() => ({isFullscreen, lockedWindowDimensions, lockWindowDimensions, unlockWindowDimensions}), [unlockWindowDimensions, lockWindowDimensions]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useFullScreenContext() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('usePlaybackContext must be used within a FullScreenContextProvider');
    }
    return context;
}

FullScreenContextProvider.displayName = 'FullScreenContextProvider';

export {Context as FullScreenContext, FullScreenContextProvider, useFullScreenContext};
