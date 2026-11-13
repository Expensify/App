import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';

import variables from '@styles/variables';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

/** Width of the wide layout's left navigation bar for the given bar variant. A collapsed flat bar is a rail of icons. */
function getNavigationBarWidth(shouldUseFlatNavigationBar: boolean, isCollapsed = false) {
    if (!shouldUseFlatNavigationBar) {
        return variables.navigationTabBarSize;
    }
    return isCollapsed ? variables.flatNavigationBarCollapsedWidth : variables.flatNavigationBarWidth;
}

/** Width of the wide layout's left navigation bar, which everything placed next to it is offset by. */
function useNavigationBarWidth() {
    const {isCollapsed} = useSearchSidebarCollapse();
    return getNavigationBarWidth(useShouldUseFlatNavigationBar(), isCollapsed);
}

export default useNavigationBarWidth;
export {getNavigationBarWidth};
