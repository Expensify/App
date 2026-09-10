import type {NavigationLayoutMode} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type SplitNavigatorRouterOptions = StackRouterOptions & {
    defaultCentralScreen: string;
    sidebarScreen: string;
    parentRoute: RouteProp<ParamListBase>;
    layoutMode?: NavigationLayoutMode;
    getShouldUseNarrowLayout?: () => boolean;
};

export default SplitNavigatorRouterOptions;
