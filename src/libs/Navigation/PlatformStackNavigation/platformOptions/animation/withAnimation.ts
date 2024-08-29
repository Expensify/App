import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import none from './none';
import slideFromBottom from './slideFromBottom';
import slideFromLeft from './slideFromLeft';
import slideFromRight from './slideFromRight';

function withAnimation<PlatformSpecificNavigationOptions extends StackNavigationOptions | NativeStackNavigationOptions>(
    screenOptions: PlatformStackNavigationOptions,
): PlatformSpecificNavigationOptions {
    switch (screenOptions?.animation) {
        case 'slide_from_left':
            return slideFromLeft as PlatformSpecificNavigationOptions;
        case 'slide_from_right':
            return slideFromRight as PlatformSpecificNavigationOptions;
        case 'modal':
            return slideFromBottom as PlatformSpecificNavigationOptions;
        case 'none':
            return none as PlatformSpecificNavigationOptions;
        default:
            return slideFromRight as PlatformSpecificNavigationOptions;
    }
}

export default withAnimation;
