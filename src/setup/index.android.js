import {Platform, UIManager} from 'react-native';

export default function () {
    // To use layout animations in Android: https://reactnative.dev/docs/layoutanimation
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
