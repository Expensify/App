import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const slideFromRight: PlatformSpecificNavigationOptions = {animation: 'none', gestureDirection: 'horizontal'} satisfies StackNavigationOptions;

export default slideFromRight;
