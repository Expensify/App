import Text from '@components/Text';

import React from 'react';

import type TabBarLabelBoldPlaceholderProps from './types';

function TabBarLabelBoldPlaceholder({label, numberOfLines, style}: TabBarLabelBoldPlaceholderProps) {
    return (
        <Text
            aria-hidden
            numberOfLines={numberOfLines}
            style={style}
        >
            {label}
        </Text>
    );
}

export default TabBarLabelBoldPlaceholder;
