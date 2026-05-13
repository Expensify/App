import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputLabelProps from './types';

function TextInputLabel({label, labelScale, labelTranslateY, isMultiline, nativeID}: TextInputLabelProps) {
    const styles = useThemeStyles();

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));
    const animatedStyleForText = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale, true));

    return (
        <Animated.View style={[styles.textInputLabelContainer, animatedStyle]}>
            <Animated.Text
                nativeID={nativeID}
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility={nativeID ? 'yes' : 'no'}
                numberOfLines={!isMultiline ? 1 : undefined}
                ellipsizeMode={!isMultiline ? 'tail' : undefined}
                allowFontScaling={false}
                style={[styles.textInputLabel, animatedStyleForText]}
            >
                {label}
            </Animated.Text>
        </Animated.View>
    );
}

export default TextInputLabel;
