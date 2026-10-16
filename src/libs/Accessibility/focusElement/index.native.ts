import {AccessibilityInfo} from 'react-native';

import type FocusElement from './types';

/** Moves screen reader focus to the element, since a View takes no keyboard focus on iOS and Android */
const focusElement: FocusElement = (element) => {
    if (!element) {
        return;
    }
    AccessibilityInfo.sendAccessibilityEvent(element, 'focus');
};

export default focusElement;
