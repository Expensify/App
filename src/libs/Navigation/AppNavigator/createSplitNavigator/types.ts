import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type SplitNavigatorRouterOptions = StackRouterOptions & {defaultCentralScreen: string; sidebarScreen: string; parentRoute: RouteProp<ParamListBase>};

export default SplitNavigatorRouterOptions;
