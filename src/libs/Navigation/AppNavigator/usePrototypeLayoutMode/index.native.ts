import useWindowDimensions from '@hooks/useWindowDimensions';

import type {NavigationLayoutMode} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

function usePrototypeLayoutMode(): NavigationLayoutMode {
    const {windowWidth} = useWindowDimensions();

    return windowWidth > variables.mobileResponsiveWidthBreakpoint ? 'wide' : 'narrow';
}

export default usePrototypeLayoutMode;
