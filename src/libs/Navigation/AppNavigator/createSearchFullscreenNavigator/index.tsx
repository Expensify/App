import type {NavigationProp, NavigatorTypeBagBase, ParamListBase, StaticConfig, TypedNavigator} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import SearchSidebar from '@components/Navigation/SearchSidebar';
import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@navigation/PlatformStackNavigation/types';
import SearchFullscreenRouter from './SearchFullscreenRouter';
import useCustomState from './useCustomState';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
    usePreserveNavigatorState(props.state, props.parentRoute);
}

const SearchFullscreenNavigatorComponent = createPlatformStackNavigatorComponent('SearchFullscreenNavigator', {
    createRouter: SearchFullscreenRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
    useCustomState,
    ExtraContent: SearchSidebar,
});

function createSearchFullscreenNavigator<
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
        Navigator: typeof SearchFullscreenNavigatorComponent;
    },
    const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createNavigatorFactory(SearchFullscreenNavigatorComponent)(config);
}

export default createSearchFullscreenNavigator;
