import type {TupleToUnion} from 'type-fest';
import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import RootNavigatorExtraContent from '@components/Navigation/RootNavigatorExtraContent';
import addRootHistoryRouterExtension from '@libs/Navigation/AppNavigator/routerExtensions/addRootHistoryRouterExtension';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import RootStackRouter from './RootStackRouter';
import useCustomRootStackNavigatorState from './useCustomRootStackNavigatorState';

function removeDuplicateNavigatorsFromState(state: PlatformStackNavigationState<ParamListBase>) {
    if (!state.routes || state.routes.length <= 1) {
        return state;
    }

    const lastRoute = state.routes.at(state.routes.length - 1);

    type RouteType = TupleToUnion<typeof state.routes>;
    const uniqueRoutesMap = new Map<string, RouteType>();

    for (const route of state.routes) {
        if (route.key !== lastRoute.key) {
            uniqueRoutesMap.set(route.name, route);
        }
    }

    const finalRoutes = [...uniqueRoutesMap.values(), lastRoute];

    return {
        ...state,
        routes: finalRoutes,
        index: finalRoutes.length - 1,
    };
}

const RootStackNavigatorComponent = createPlatformStackNavigatorComponent('RootStackNavigator', {
    createRouter: addRootHistoryRouterExtension(RootStackRouter),
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects: useNavigationResetOnLayoutChange,
    useCustomState: (props) => {
        const result = useCustomRootStackNavigatorState(props);

        return {
            ...result,
            state: removeDuplicateNavigatorsFromState(result),
        };
    },
    ExtraContent: RootNavigatorExtraContent,
});

function createRootStackNavigator<
    const ParamList extends ParamListBase,
    const NavigatorID extends string | undefined = undefined,
    const TypeBag extends NavigatorTypeBagBase = {
        ParamList: ParamList;
        NavigatorID: NavigatorID;
        State: PlatformStackNavigationState<ParamList>;
        ScreenOptions: PlatformStackNavigationOptions;
        EventMap: PlatformStackNavigationEventMap;
        NavigationList: {
            [RouteName in keyof ParamList]: NavigationProp<ParamList, RouteName, NavigatorID>;
        };
        Navigator: typeof RootStackNavigatorComponent;
    },
    const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createNavigatorFactory(RootStackNavigatorComponent)(config);
}

export default createRootStackNavigator;
