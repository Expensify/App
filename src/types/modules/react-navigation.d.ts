import type {ParamListBase, PartialRoute, Route} from '@react-navigation/native';
import type {RootStackParamList} from '@libs/Navigation/types';

declare global {
    namespace ReactNavigation {
        // eslint-disable-next-line
        interface RootParamList extends RootStackParamList {}
    }
}

declare module '@react-navigation/native' {
    type PartialState<State extends NavigationState> = Partial<Omit<State, 'stale' | 'routes'>> & {
        stale?: true;
        routes: Array<PartialRoute<Route<State['routeNames'][number]>>>;
    };
    type NavigationRoute<ParamList extends ParamListBase, RouteName extends keyof ParamList> = Route<Extract<RouteName, string>, ParamList[RouteName]> & {
        state?: NavigationState | PartialState<NavigationState>;
    };
    type NavigationState<ParamList extends ParamListBase = ParamListBase> = {
        /**
         * Unique key for the navigation state.
         */
        key: string;
        /**
         * Index of the currently focused route.
         */
        index: number;
        /**
         * List of valid route names as defined in the screen components.
         */
        routeNames: Array<Extract<keyof ParamList, string>>;
        /**
         * Alternative entries for history.
         */
        history?: unknown[];
        /**
         * List of rendered routes.
         */
        routes: Array<NavigationRoute<ParamList, keyof ParamList>>;
        /**
         * Custom type for the state, whether it's for tab, stack, drawer etc.
         * During rehydration, the state will be discarded if type doesn't match with router type.
         * It can also be used to detect the type of the navigator we're dealing with.
         */
        type: string;
        /**
         * Whether the navigation state has been rehydrated.
         */
        stale: false;
    };
}
