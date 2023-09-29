import {AccessibilityInfo} from 'react-native';
import MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    if (!ref) {
        return;
    }

    AccessibilityInfo.sendAccessibilityEvent(ref, 'focus');
};

export default moveAccessibilityFocus;
