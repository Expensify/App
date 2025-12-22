import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputLabelProps from './types';

function TextInputLabel({label, labelScale, labelTranslateY, isMultiline}: TextInputLabelProps) {
    const styles = useThemeStyles();

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));
    const animatedStyleForText = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale, true));

    return (
        <Animated.View style={[styles.textInputLabelContainer, animatedStyle]}>
            <Animated.Text
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
