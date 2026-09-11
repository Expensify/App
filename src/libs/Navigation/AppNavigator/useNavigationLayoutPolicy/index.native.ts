import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getNavigationLayoutPolicy from '@libs/Navigation/AppNavigator/getNavigationLayoutPolicy';

function useNavigationLayoutPolicy(isEnabled = true) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const safeAreaInsets = useSafeAreaInsets();

    return getNavigationLayoutPolicy({width: windowWidth, height: windowHeight, safeAreaInsets}, {forceNarrowInLandscape: false, includeNavigationRail: true, isEnabled});
}

export default useNavigationLayoutPolicy;
