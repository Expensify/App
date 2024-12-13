import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '..';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {animation: Animations.NONE, gestureEnabled: false} satisfies NativeStackNavigationOptions;

export default none;
