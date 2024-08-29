import type {ParamListBase, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import noAnimation from './animation/native/none';
import slideFromBottomAnimation from './animation/native/slideFromBottom';
import slideFromLeftAnimation from './animation/native/slideFromLeft';
import slideFromRightAnimation from './animation/native/slideFromRight';
import withAnimation from './animation/withAnimation';
import getCommonNavigationOptions from './utils';

const convertPlatformOptions = (screenOptions: PlatformStackNavigationOptions): NativeStackNavigationOptions => ({
    keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled,
    ...withAnimation<NativeStackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, slideFromBottomAnimation, noAnimation),
    ...getCommonNavigationOptions(screenOptions),
    ...screenOptions.native,
});

function withNativeNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<NativeStackNavigationOptions> | undefined {
    if (screenOptions === undefined) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        return (p: PlatformStackScreenProps<ParamListBase, string>) => {
            const routeBasedScreenOptions = screenOptions(p);
            return convertPlatformOptions(routeBasedScreenOptions);
        };
    }

    return convertPlatformOptions(screenOptions);
}

export default withNativeNavigationOptions;
