import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {FullScreenContext} from './types';

const Context = React.createContext<FullScreenContext | null>(null);

function FullScreenContextProvider({children}: ChildrenProps) {
    const isFullscreenRef = useRef(false);
    const lockedWindowDimensionsRef = useRef<WindowDimensions | null>(null);

    const lockWindowDimensions = useCallback((newWindowDimensions: WindowDimensions) => {
        lockedWindowDimensionsRef.current = newWindowDimensions;
    }, []);

    const unlockWindowDimensions = useCallback(() => {
        lockedWindowDimensionsRef.current = null;
    }, []);

    const contextValue = useMemo(() => ({isFullscreenRef, lockedWindowDimensionsRef, lockWindowDimensions, unlockWindowDimensions}), [lockWindowDimensions, unlockWindowDimensions]);
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
