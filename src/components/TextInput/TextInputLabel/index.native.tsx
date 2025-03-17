import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputLabelProps from './types';

function TextInputLabel({label, labelScale, labelTranslateY}: TextInputLabelProps) {
    const styles = useThemeStyles();

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));

    return (
        <Animated.Text
            allowFontScaling={false}
            style={[styles.textInputLabel, animatedStyle]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default TextInputLabel;
