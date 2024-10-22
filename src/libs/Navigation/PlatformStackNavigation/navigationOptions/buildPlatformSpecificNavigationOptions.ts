import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {CommonStackNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import withAnimation from './animation/withAnimation';

const getCommonNavigationOptions = (screenOptions: PlatformStackNavigationOptions | undefined): CommonStackNavigationOptions =>
    screenOptions === undefined ? {} : (({animation, keyboardHandlingEnabled, web, native, ...rest}: PlatformStackNavigationOptions) => rest)(screenOptions);

const buildPlatformSpecificNavigationOptions = <PlatformSpecificNavigationOptions extends StackNavigationOptions | NativeStackNavigationOptions>(
    screenOptions: PlatformStackNavigationOptions,
): PlatformSpecificNavigationOptions => ({
    keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled,
    ...withAnimation<PlatformSpecificNavigationOptions>(screenOptions),
    ...getCommonNavigationOptions(screenOptions),
});

export default buildPlatformSpecificNavigationOptions;
