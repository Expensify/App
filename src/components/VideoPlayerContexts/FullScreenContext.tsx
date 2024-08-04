import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {ResponsiveLayoutResult} from '@hooks/useResponsiveLayout';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {FullScreenContext} from './types';

const Context = React.createContext<FullScreenContext | null>(null);

type ResponsiveLayoutProperties = WindowDimensions & Partial<ResponsiveLayoutResult>;

function FullScreenContextProvider({children}: ChildrenProps) {
    const isFullScreenRef = useRef(false);
    const lockedResponsiveLayoutResultRef = useRef<ResponsiveLayoutProperties | null>(null);

    const lockResponsiveLayoutResult = useCallback((newResponsiveLayoutResult: ResponsiveLayoutProperties) => {
        lockedResponsiveLayoutResultRef.current = newResponsiveLayoutResult;
    }, []);

    const unlockResponsiveLayoutResult = useCallback(() => {
        lockedResponsiveLayoutResultRef.current = null;
    }, []);

    const contextValue = useMemo(
        () => ({isFullScreenRef, lockedResponsiveLayoutResultRef, lockResponsiveLayoutResult, unlockResponsiveLayoutResult}),
        [lockResponsiveLayoutResult, unlockResponsiveLayoutResult],
    );
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function useFullScreenContext() {
    const fullscreenContext = useContext(Context);
    if (!fullscreenContext) {
        throw new Error('useFullScreenContext must be used within a FullScreenContextProvider');
    }
    return fullscreenContext;
}

FullScreenContextProvider.displayName = 'FullScreenContextProvider';

export {Context as FullScreenContext, FullScreenContextProvider, useFullScreenContext};
export type {ResponsiveLayoutProperties};
