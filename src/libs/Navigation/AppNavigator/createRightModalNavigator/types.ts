import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type RightModalNavigatorRouterOptions = StackRouterOptions & {parentRoute: RouteProp<ParamListBase>};

export default RightModalNavigatorRouterOptions;
