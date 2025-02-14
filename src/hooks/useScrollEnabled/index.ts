import {useIsFocused} from '@react-navigation/native';
import useIsBottomTabVisibleDirectly from '@components/Navigation/TopLevelBottomTabBar/useIsBottomTabVisibleDirectly';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type UseScrollEnabled from './types';

const useScrollEnabled: UseScrollEnabled = () => {
    const isFocused = useIsFocused();
    const isBottomTabVisibleDirectly = useIsBottomTabVisibleDirectly();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // On the SIDEBAR_TO_SPLIT  isFocused returns false, but it is actually focused
    if (shouldUseNarrowLayout) {
        return isFocused || isBottomTabVisibleDirectly;
    }

    return isFocused;
};
export default useScrollEnabled;
