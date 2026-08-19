import {useIsCompactMenu} from '@components/CompactMenuContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

function useIsCompactPopover() {
    const {isSmallScreenWidth} = useResponsiveLayout(); // eslint-disable-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const isCompactMenu = useIsCompactMenu();
    return isCompactMenu && !isSmallScreenWidth;
}

export default useIsCompactPopover;
