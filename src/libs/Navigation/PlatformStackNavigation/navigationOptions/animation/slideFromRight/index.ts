import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import {InternalPlatformAnimations} from '..';

const slideFromRight: PlatformSpecificNavigationOptions = {
    animation: InternalPlatformAnimations.SLIDE_FROM_RIGHT,
    gestureDirection: 'horizontal',
    transitionSpec: {
        open: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB}},
        close: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB}},
    },
} satisfies StackNavigationOptions;

export default slideFromRight;
