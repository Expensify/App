import Text from '@components/Text';

import CONST from '@src/CONST';

import React from 'react';

import type TabBarLabelBoldPlaceholderProps from './types';

/** The label is drawn by a CSS pseudo-element, so it stays out of the text a browser takes when the tab link is dragged or copied. */
function TabBarLabelBoldPlaceholder({label, numberOfLines, style}: TabBarLabelBoldPlaceholderProps) {
    return (
        <Text
            aria-hidden
            numberOfLines={numberOfLines}
            style={style}
            dataSet={{[CONST.TAB_BAR_LABEL_BOLD_PLACEHOLDER]: label}}
        >
            {null}
        </Text>
    );
}

export default TabBarLabelBoldPlaceholder;
