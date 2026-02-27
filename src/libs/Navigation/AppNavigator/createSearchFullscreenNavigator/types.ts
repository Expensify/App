import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type SearchFullscreenNavigatorRouterOptions = StackRouterOptions & {parentRoute: RouteProp<ParamListBase>};

export default SearchFullscreenNavigatorRouterOptions;
