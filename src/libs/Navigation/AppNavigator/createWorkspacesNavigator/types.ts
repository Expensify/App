import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type WorkspacesNavigatorRouterOptions = StackRouterOptions & {parentRoute: RouteProp<ParamListBase>};

export default WorkspacesNavigatorRouterOptions;
