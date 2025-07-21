import {createNavigatorFactory} from '@react-navigation/native';
import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';
import RootNavigatorExtraContent from '@components/Navigation/RootNavigatorExtraContent';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomStateHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import RootStackRouter from './RootStackRouter';

// This is an optimization to keep mounted only last few screens in the stack.
function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const routesToRender = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

const RootStackNavigatorComponent = createPlatformStackNavigatorComponent('RootStackNavigator', {
    createRouter: RootStackRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects: useNavigationResetOnLayoutChange,
    useCustomState: useCustomRootStackNavigatorState,
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
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createNavigatorFactory(RootStackNavigatorComponent)(config);
}

export default createRootStackNavigator;
