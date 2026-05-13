import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import WorkspaceRouter from './WorkspaceRouter';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
    usePreserveNavigatorState(props.state, props.parentRoute);
}

const WorkspaceNavigatorComponent = createPlatformStackNavigatorComponent(NAVIGATORS.WORKSPACE_NAVIGATOR, {
    createRouter: WorkspaceRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
});

function createWorkspaceNavigator<
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
        Navigator: typeof WorkspaceNavigatorComponent;
    },
    const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createNavigatorFactory(WorkspaceNavigatorComponent)(config);
}

export default createWorkspaceNavigator;
