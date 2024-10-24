import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '..';
import type SlideFromBottomTransitionNavigationOptions from './types';

const slideFromBottom: SlideFromBottomTransitionNavigationOptions = {animation: Animations.SLIDE_FROM_BOTTOM} satisfies NativeStackNavigationOptions;

export default slideFromBottom;
