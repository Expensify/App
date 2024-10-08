import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '..';

// `slide_from_right` is resolved to `default` transition on iOS, but this transition causes issues on iOS
const slideFromLeft: NativeStackNavigationOptions = {animation: Animations.IOS_FROM_LEFT};

export default slideFromLeft;
