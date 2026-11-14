import {getFlatNavigationBarLayoutWidth} from '@components/Navigation/SearchSidebarCollapseStore';

import useOnyx from '@hooks/useOnyx';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

/** Width of the wide layout's left navigation bar for the given bar variant. Peeking overlays the content, so only the collapsed flag counts. */
function getNavigationBarWidth(shouldUseFlatNavigationBar: boolean, isCollapsed = false) {
    return shouldUseFlatNavigationBar ? getFlatNavigationBarLayoutWidth(isCollapsed) : variables.navigationTabBarSize;
}

/** Width of the wide layout's left navigation bar, which everything placed next to it is offset by. */
function useNavigationBarWidth() {
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();
    const [isCollapsed = false] = useOnyx(ONYXKEYS.NVP_SEARCH_SIDEBAR, {
        selector: (nvp) => nvp?.isCollapsed ?? false,
    });

    return getNavigationBarWidth(shouldUseFlatNavigationBar, isCollapsed);
}

export default useNavigationBarWidth;
