import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const slideFromRight: PlatformSpecificNavigationOptions = {animationEnabled: true, gestureDirection: 'horizontal'} satisfies StackNavigationOptions;

export default slideFromRight;
