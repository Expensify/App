import {useMemo} from 'react';
import type {ScreenWrapperOfflineIndicatorContextType} from '@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext';
import ScreenWrapperOfflineIndicatorContext from '@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function NarrowPaneOfflineIndicatorContextProvider({children}: ChildrenProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const offlineIndicatorContextValue: ScreenWrapperOfflineIndicatorContextType = useMemo(
        () => ({
            addSafeAreaPadding: shouldUseNarrowLayout,
        }),
        [shouldUseNarrowLayout],
    );

    return <ScreenWrapperOfflineIndicatorContext.Provider value={offlineIndicatorContextValue}>{children}</ScreenWrapperOfflineIndicatorContext.Provider>;
}

export default NarrowPaneOfflineIndicatorContextProvider;
