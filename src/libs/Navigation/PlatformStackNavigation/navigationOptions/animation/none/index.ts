import type {StackNavigationOptions} from '@react-navigation/stack';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {animationEnabled: false, gestureEnabled: false} satisfies StackNavigationOptions;

export default none;
