import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type TextInputLabelProps from './types';

function TextInputLabel({label, labelScale, labelTranslateY, isMultiline, shouldLabelStayOnSingleLine}: TextInputLabelProps) {
    const styles = useThemeStyles();
    const shouldClipToSingleLine = !isMultiline || shouldLabelStayOnSingleLine;

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));
    const animatedStyleForText = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale, true));

    return (
        <Animated.View style={[styles.textInputLabelContainer, animatedStyle]}>
            <Animated.Text
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no"
                numberOfLines={shouldClipToSingleLine ? 1 : undefined}
                ellipsizeMode={shouldClipToSingleLine ? 'tail' : undefined}
                allowFontScaling={false}
                style={[styles.textInputLabel, animatedStyleForText]}
            >
                {label}
            </Animated.Text>
        </Animated.View>
    );
}

export default TextInputLabel;
