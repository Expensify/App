import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

// `slide_from_right` is resolved to `default` transition on iOS, but this transition causes issues on iOS
const slideFromLeft: NativeStackNavigationOptions = {animation: 'ios_from_left'};

export default slideFromLeft;
