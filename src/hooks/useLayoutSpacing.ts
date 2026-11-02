import {resolveLayoutSpacing} from '@styles/layoutSpacing';
import type {LayoutSpacing} from '@styles/layoutSpacing';

import useResponsiveLayout from './useResponsiveLayout';

function useLayoutSpacing(): LayoutSpacing {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return resolveLayoutSpacing(shouldUseNarrowLayout);
}

export default useLayoutSpacing;
