import {ACTIVE_LABEL_SCALE, INACTIVE_LABEL_SCALE} from '@components/TextInput/styleConst';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import textRef from '@src/types/utils/textRef';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';

import React, {useEffect, useRef} from 'react';
import Animated, {useAnimatedReaction, useAnimatedStyle} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type TextInputLabelProps from './types';

function TextInputLabel({for: inputId = '', label, labelTranslateY, labelScale, isMultiline, shouldLabelStayOnSingleLine, onTruncationChange}: TextInputLabelProps) {
    const shouldClipToSingleLine = !isMultiline || shouldLabelStayOnSingleLine;
    const styles = useThemeStyles();
    const labelRef = useRef<ComponentRef<typeof Text> | HTMLFormElement>(null);

    useEffect(() => {
        if (!inputId || !labelRef.current || !('setAttribute' in labelRef.current)) {
            return;
        }
        labelRef.current.setAttribute('for', inputId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkTruncation = () => {
        const labelElement = labelRef.current;
        if (!onTruncationChange || !labelElement || !('scrollWidth' in labelElement)) {
            return;
        }
        onTruncationChange(labelElement.scrollWidth > labelElement.offsetWidth || labelElement.scrollHeight > labelElement.offsetHeight);
    };

    // The label keeps its width while its font size animates, so `onLayout` doesn't fire when the label shrinks to fit or
    // grows past its width. Check again once the animation settles on either size.
    useAnimatedReaction(
        () => labelScale.get(),
        (scale, previousScale) => {
            if (scale === previousScale || (scale !== ACTIVE_LABEL_SCALE && scale !== INACTIVE_LABEL_SCALE)) {
                return;
            }
            scheduleOnRN(checkTruncation);
        },
    );

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));

    return (
        <Animated.Text
            numberOfLines={shouldClipToSingleLine ? 1 : undefined}
            ellipsizeMode={shouldClipToSingleLine ? 'tail' : undefined}
            onLayout={checkTruncation}
            ref={textRef(labelRef)}
            role={CONST.ROLE.PRESENTATION}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            aria-hidden
            style={[styles.textInputLabelContainer, styles.textInputLabel, animatedStyle, styles.pointerEventsNone]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default TextInputLabel;
