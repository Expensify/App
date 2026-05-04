import type {ParamListBase, RouteProp, StackRouterOptions} from '@react-navigation/native';

type WorkspaceNavigatorRouterOptions = StackRouterOptions & {parentRoute: RouteProp<ParamListBase>};

export default WorkspaceNavigatorRouterOptions;
