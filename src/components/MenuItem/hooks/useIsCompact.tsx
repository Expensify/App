import {useIsCompactMenu} from '@components/CompactMenuContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

function useIsCompact() {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isCompactMenu = useIsCompactMenu();
    return isCompactMenu && !isSmallScreenWidth;
}

export default useIsCompact;
