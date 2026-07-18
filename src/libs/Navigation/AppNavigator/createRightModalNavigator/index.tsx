import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';

import {createNavigatorFactory} from '@react-navigation/native';

import RightModalRouter from './RightModalRouter';

function RightModalNavigatorEffects(props: CustomEffectsHookProps) {
    usePreserveNavigatorState(props.state, props.parentRoute);
    // Returning null makes Babel skip memoization for this Effects slot; an empty fragment is required.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

const RightModalNavigatorComponent = createPlatformStackNavigatorComponent(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, {
    createRouter: RightModalRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    Effects: RightModalNavigatorEffects,
    // Deliberately no nonTopScreensBehavior. A covered RHP route can be a wide RHP that stays visible behind the
    // top card and must keep running: it registers its width through useRHPWidth, whose effect CLEANUP deregisters
    // it. Hiding it with <Activity> runs exactly that cleanup, which the wide RHP system treats as the screen
    // closing - the container snaps to the single RHP width and the covered screen appears to lose its content.
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
