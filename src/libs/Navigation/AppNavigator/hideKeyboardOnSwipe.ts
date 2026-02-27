import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const hideKeyboardOnSwipe: PlatformStackNavigationOptions = {
    // temporary solution - better to hide a keyboard than see keyboard flickering
    // see https://github.com/software-mansion/react-native-screens/issues/2021 for more details
    keyboardHandlingEnabled: true,
};

export default hideKeyboardOnSwipe;
