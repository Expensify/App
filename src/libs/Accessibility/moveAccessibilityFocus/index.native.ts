import {AccessibilityInfo} from 'react-native';
import findNodeHandle from '@src/utils/findNodeHandle';
import type MoveAccessibilityFocus from './types';

const moveAccessibilityFocus: MoveAccessibilityFocus = (ref) => {
    if (!ref) {
        return;
    }

    // iOS uses setAccessibilityFocus with a native node handle.
    const nodeHandle = typeof ref === 'number' ? ref : findNodeHandle(ref);
    if (nodeHandle) {
        if (typeof AccessibilityInfo.setAccessibilityFocus === 'function') {
            AccessibilityInfo.setAccessibilityFocus(nodeHandle);
            return;
        }
    }

    // Android uses sendAccessibilityEvent.
    AccessibilityInfo.sendAccessibilityEvent(ref, 'focus');
};

export default moveAccessibilityFocus;
