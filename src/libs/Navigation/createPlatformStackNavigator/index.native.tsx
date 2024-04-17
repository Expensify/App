import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import slideFromLeftAnimation from './animation/native/slideFromLeft';
import slideFromRightAnimation from './animation/native/slideFromRight';
import {isRouteBasedScreenOptions} from './types';
import type {
    CommonStackNavigationOptions,
    NavigationOptionsRouteProps,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigator,
    PlatformStackNavigatorProps,
} from './types';

const withPolyfills = (screenOptions?: PlatformStackNavigationOptions): NativeStackNavigationOptions => {
    if (screenOptions === undefined) {
        return {};
    }

    const commonScreenOptions = (({animation, ...rest}) => rest)(screenOptions) satisfies CommonStackNavigationOptions;

    let animation: NativeStackNavigationOptions['animation'];
    switch (screenOptions.animation) {
        case 'slide_from_right':
            animation = slideFromRightAnimation;
            break;
        case 'slide_from_left':
            animation = slideFromLeftAnimation;
            break;
        case 'modal':
            animation = 'slide_from_bottom';
            break;
        default:
            animation = undefined;
    }

    return {
        ...commonScreenOptions,
        animation,
    };
};

function createPlatformStackNavigator<TStackParams extends ParamListBase>() {
    const NativeStack = createNativeStackNavigator<TStackParams>();

    function PlatformStackNavigator({screenOptions, initialRouteName, children}: PlatformStackNavigatorProps<TStackParams>) {
        const nativeScreenOptions = isRouteBasedScreenOptions(screenOptions)
            ? (props: NavigationOptionsRouteProps<TStackParams>) => {
                  const routeBasedScreenOptions = screenOptions(props);
                  return withPolyfills(routeBasedScreenOptions);
              }
            : withPolyfills(screenOptions);

        return (
            <NativeStack.Navigator
                screenOptions={nativeScreenOptions}
                initialRouteName={initialRouteName}
            >
                {children}
            </NativeStack.Navigator>
        );
    }

    return createNavigatorFactory<StackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, PlatformStackNavigator<TStackParams>>(
        PlatformStackNavigator,
    )();
}

export default createPlatformStackNavigator;
