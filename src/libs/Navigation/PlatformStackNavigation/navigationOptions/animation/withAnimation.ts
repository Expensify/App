import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import fade from './fade';
import Animations from './index';
import none from './none';
import slideFromBottom from './slideFromBottom';
import slideFromLeft from './slideFromLeft';
import slideFromRight from './slideFromRight';

function withAnimation<PlatformSpecificNavigationOptions extends StackNavigationOptions | NativeStackNavigationOptions>(
    screenOptions: PlatformStackNavigationOptions,
): PlatformSpecificNavigationOptions {
    switch (screenOptions?.animation) {
        case Animations.SLIDE_FROM_LEFT:
            return slideFromLeft as PlatformSpecificNavigationOptions;
        case Animations.SLIDE_FROM_RIGHT:
            return slideFromRight as PlatformSpecificNavigationOptions;
        case Animations.MODAL:
            return slideFromBottom as PlatformSpecificNavigationOptions;
        case Animations.NONE:
            return none as PlatformSpecificNavigationOptions;
        case Animations.FADE:
            return fade as PlatformSpecificNavigationOptions;
        default:
            return {} as PlatformSpecificNavigationOptions;
    }
}

export default withAnimation;
