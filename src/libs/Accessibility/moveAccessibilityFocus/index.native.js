import {AccessibilityInfo} from 'react-native';

const moveAccessibilityFocus = (ref) => {
    if (!ref) {
        return;
    }
    AccessibilityInfo.sendAccssibilityEvent(ref, 'focus');
};

export default moveAccessibilityFocus;