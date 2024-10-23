import React from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type TextInputLabelProps from './types';

function TextInputLabel({label, labelScale, labelTranslateY}: TextInputLabelProps) {
    const styles = useThemeStyles();

    return (
        <Animated.Text
            allowFontScaling={false}
            style={[styles.textInputLabel, styles.textInputLabelTransformation(labelTranslateY, labelScale)]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default TextInputLabel;
