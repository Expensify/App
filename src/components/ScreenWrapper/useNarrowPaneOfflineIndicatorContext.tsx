import {useMemo} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {ScreenWrapperOfflineIndicatorContextType} from './ScreenWrapperOfflineIndicatorContext';

function useNarrowPaneOfflineIndicatorContext() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return useMemo<ScreenWrapperOfflineIndicatorContextType>(() => ({isInNarrowPane: true, addSafeAreaPadding: shouldUseNarrowLayout}), [shouldUseNarrowLayout]);
}

export default useNarrowPaneOfflineIndicatorContext;
