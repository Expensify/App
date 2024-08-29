import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

function withAnimation<PlatformOptions extends StackNavigationOptions | NativeStackNavigationOptions>(
    screenOptions: PlatformStackNavigationOptions,
    slideFromLeft: PlatformOptions,
    slideFromRight: PlatformOptions,
    slideFromBottom: PlatformOptions,
    none: PlatformOptions,
) {
    let animationOptions: PlatformOptions;
    switch (screenOptions?.animation) {
        case 'slide_from_left':
            animationOptions = slideFromLeft;
            break;
        case 'slide_from_right':
            animationOptions = slideFromRight;
            break;
        case 'modal':
            animationOptions = slideFromBottom;
            break;
        case 'none':
            animationOptions = none;
            break;
        default:
            animationOptions = slideFromRight;
    }

    return animationOptions;
}

export default withAnimation;
