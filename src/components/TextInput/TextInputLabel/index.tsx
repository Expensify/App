import React, {useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import textRef from '@src/types/utils/textRef';
import type TextInputLabelProps from './types';

function TextInputLabel({for: inputId = '', label, labelTranslateY, labelScale, isMultiline}: TextInputLabelProps) {
    const styles = useThemeStyles();
    const labelRef = useRef<Text | HTMLFormElement>(null);

    useEffect(() => {
        if (!inputId || !labelRef.current || !('setAttribute' in labelRef.current)) {
            return;
        }
        labelRef.current.setAttribute('for', inputId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));

    return (
        <Animated.Text
            numberOfLines={!isMultiline ? 1 : undefined}
            ellipsizeMode={!isMultiline ? 'tail' : undefined}
            ref={textRef(labelRef)}
            role={CONST.ROLE.PRESENTATION}
            style={[styles.textInputLabelContainer, styles.textInputLabel, animatedStyle, styles.pointerEventsNone]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default React.memo(TextInputLabel);
