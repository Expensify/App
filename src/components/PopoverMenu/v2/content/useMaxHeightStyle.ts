import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';

function useMaxHeightStyle({desktopFallback}: {desktopFallback?: ViewStyle} = {}): ViewStyle | undefined {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    if (isInLandscapeMode) {
        return undefined;
    }
    if (isSmallScreenWidth) {
        return {maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT_MOBILE};
    }
    return desktopFallback;
}

export default useMaxHeightStyle;
