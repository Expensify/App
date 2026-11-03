import variables from '@styles/variables';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

/** Width of the wide layout's left navigation bar for the given bar variant. */
function getNavigationBarWidth(shouldUseFlatNavigationBar: boolean) {
    return shouldUseFlatNavigationBar ? variables.flatNavigationBarWidth : variables.navigationTabBarSize;
}

/** Width of the wide layout's left navigation bar, which everything placed next to it is offset by. */
function useNavigationBarWidth() {
    return getNavigationBarWidth(useShouldUseFlatNavigationBar());
}

export default useNavigationBarWidth;
export {getNavigationBarWidth};
