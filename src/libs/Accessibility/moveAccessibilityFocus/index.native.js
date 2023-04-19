import {AccessibilityInfo} from 'react-native';

const moveAccessibilityFocus = (ref) => {
    if (!ref) {
        return;
    }
    AccessibilityInfo.sendAccessibilityEvent(ref, 'focus');
};

export default moveAccessibilityFocus;
