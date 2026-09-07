/**
 * `react-native-plain-text` renders through a custom Fabric host component (`RNPlainText`) with C++ intrinsic-size
 * measurement. In the Jest environment that host component does not expose its string children, so text queries
 * (e.g. `getByText`) cannot find the content. This mock renders RN's own `Text` so text queries keep working.
 */
import type {AccessibilityProps, StyleProp, TextStyle} from 'react-native';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text} from 'react-native';

type PlainTextStyle = TextStyle & {
    fontVariationSettings?: string;
};

type PlainTextProps = AccessibilityProps & {
    children?: string;
    style?: StyleProp<PlainTextStyle>;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
    testID?: string;
    nativeID?: string;
};

function PlainText({children, style, numberOfLines, ellipsizeMode, allowFontScaling, testID, nativeID, ...accessibilityProps}: PlainTextProps) {
    return (
        <Text
            style={style}
            numberOfLines={numberOfLines}
            ellipsizeMode={ellipsizeMode}
            allowFontScaling={allowFontScaling}
            testID={testID}
            nativeID={nativeID}
            {...accessibilityProps}
        >
            {children}
        </Text>
    );
}

export default PlainText;
export {PlainText};
export type {PlainTextProps, PlainTextStyle};
