import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type SplitNavigatorRouterOptions = StackRouterOptions & {
    defaultCentralScreen: string;
    sidebarScreen: string;
    parentRoute: RouteProp<ParamListBase>;
    getShouldUseNarrowLayout?: () => boolean;
};

export default SplitNavigatorRouterOptions;
