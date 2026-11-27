import React from 'react';
import {View} from 'react-native';

import type CountdownAccessibilityWrapperProps from './types';

/** The time sits in a link that would be read alone as "00:26", so native reads the countdown as one disabled sentence. */
function CountdownAccessibilityWrapper({accessibilityLabel, children}: CountdownAccessibilityWrapperProps) {
    return (
        <View
            accessible
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{disabled: true}}
        >
            {/* Android still focuses a clickable child inside an accessible parent, so the link is hidden from TalkBack here */}
            <View importantForAccessibility="no-hide-descendants">{children}</View>
        </View>
    );
}

export default CountdownAccessibilityWrapper;
