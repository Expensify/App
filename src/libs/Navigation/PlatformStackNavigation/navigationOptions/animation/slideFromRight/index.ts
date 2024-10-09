import type {StackNavigationOptions} from '@react-navigation/stack';
import type SlideFromRightTransitionNavigationOptions from './types';

const slideFromRight: SlideFromRightTransitionNavigationOptions = {animationEnabled: true, gestureDirection: 'horizontal'} satisfies StackNavigationOptions;

export default slideFromRight;
