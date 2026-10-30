import variables from '@styles/variables';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

/** Width of the wide layout's left navigation bar, which everything placed next to it is offset by. */
function useNavigationBarWidth() {
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();

    return shouldUseFlatNavigationBar ? variables.flatNavigationBarWidth : variables.navigationTabBarSize;
}

export default useNavigationBarWidth;
