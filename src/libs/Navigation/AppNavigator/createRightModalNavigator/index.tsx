import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import RightModalRouter from './RightModalRouter';

function useCustomEffects(props: CustomEffectsHookProps) {
    usePreserveNavigatorState(props.state, props.parentRoute);
}

const RightModalNavigatorComponent = createPlatformStackNavigatorComponent(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, {
    createRouter: RightModalRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
});

function createRightModalNavigator<
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
        Navigator: typeof RightModalNavigatorComponent;
    },
    const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createNavigatorFactory(RightModalNavigatorComponent)(config);
}

export default createRightModalNavigator;
