import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

function withAnimation<PlatformOptions extends StackNavigationOptions | NativeStackNavigationOptions>(
    screenOptions: PlatformStackNavigationOptions,
    slideInFromLeft: PlatformOptions,
    slideInFromRight: PlatformOptions,
    slideInFromBottom: PlatformOptions,
) {
    let animationOptions: PlatformOptions | undefined;
    switch (screenOptions.animation ?? 'slide_from_right') {
        case 'slide_from_left':
            animationOptions = slideInFromLeft;
            break;
        case 'slide_from_right':
            animationOptions = slideInFromRight;
            break;
        case 'modal':
            animationOptions = slideInFromBottom;
            break;
        default:
            animationOptions = undefined;
    }

    return animationOptions;
}

export default withAnimation;
