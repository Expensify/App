import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {useLayoutEffect, useRef, useState} from 'react';

import type {NavigationLayoutMode} from './types';

function useNavigationLayoutMode(layoutMode: NavigationLayoutMode | undefined) {
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutFallback} = useResponsiveLayout();
    const shouldUseNarrowLayout = layoutMode ? layoutMode === 'narrow' : shouldUseNarrowLayoutFallback;
    const shouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);

    useLayoutEffect(() => {
        shouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
    }, [shouldUseNarrowLayout]);

    const [getShouldUseNarrowLayout] = useState(() => () => shouldUseNarrowLayoutRef.current);

    return {shouldUseNarrowLayout, getShouldUseNarrowLayout};
}

export default useNavigationLayoutMode;
