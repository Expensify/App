import {useIsFocused, useNavigationState} from '@react-navigation/native';
import SIDEBAR_TO_SPLIT from '@libs/Navigation/linkingConfig/RELATIONS/SIDEBAR_TO_SPLIT';
import useResponsiveLayout from './useResponsiveLayout';

const useBottomTabIsFocused = () => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const navigationState = useNavigationState((state) => state);

    if (shouldUseNarrowLayout) {
        return isFocused;
    }

    // On desktop screen sizes, isFocused always returns false, so we cannot rely on it alone to determine if the bottom tab is focused
    return isFocused || navigationState?.routes?.some((route) => Object.keys(SIDEBAR_TO_SPLIT).includes(route.name));
};

export default useBottomTabIsFocused;
