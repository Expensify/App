import type {StackNavigationOptions} from '@react-navigation/stack';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {animation: 'none', gestureEnabled: false} satisfies StackNavigationOptions;

export default none;
