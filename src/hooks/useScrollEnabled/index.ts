import {useIsFocused} from '@react-navigation/native';
import useIsBottomTabVisibleDirectly from '@components/Navigation/TopLevelBottomTabBar/useIsBottomTabVisibleDirectly';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type UseScrollEnabled from './types';

const useScrollEnabled: UseScrollEnabled = (RNScrollEnabled?: boolean) => {
    const isFocused = useIsFocused();
    const isBottomTabVisibleDirectly = useIsBottomTabVisibleDirectly();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    if (RNScrollEnabled !== undefined) {
        return RNScrollEnabled;
    }
    // On the SIDEBAR_TO_SPLIT  isFocused returns false, but it is actually focused
    if (shouldUseNarrowLayout) {
        return isFocused || isBottomTabVisibleDirectly;
    }

    return isFocused;
};
export default useScrollEnabled;
