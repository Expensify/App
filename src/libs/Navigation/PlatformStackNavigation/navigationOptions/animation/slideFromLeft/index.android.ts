import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '..';
import type SlideFromLeftTransitionNavigationOptions from './types';

// `slide_from_right` is resolved to `default` transition on iOS, but this transition causes issues on iOS
const slideFromLeft: SlideFromLeftTransitionNavigationOptions = {animation: Animations.IOS_FROM_LEFT} satisfies NativeStackNavigationOptions;

export default slideFromLeft;
