import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import slideFromLeftAnimation from './animationOptions/native/slideFromLeft';
import slideFromRightAnimation from './animationOptions/native/slideFromRight';
import withAnimation from './animationOptions/withAnimation';
import getCommonNavigationOptions from './utils';

const withNativeOptions = (screenOptions?: PlatformStackNavigationOptions): NativeStackNavigationOptions => {
    if (screenOptions === undefined) {
        return {};
    }

    return {
        ...withAnimation<NativeStackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, {animation: 'slide_from_bottom'}),
        ...getCommonNavigationOptions(screenOptions),
    };
};

export default withNativeOptions;
