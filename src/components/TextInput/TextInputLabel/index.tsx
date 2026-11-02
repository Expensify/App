import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import textRef from '@src/types/utils/textRef';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';

import React, {useEffect, useRef} from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type TextInputLabelProps from './types';

import LabelScaleSettleListener from './LabelScaleSettleListener';

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

    // The input sets the label's width, so new text (a language switch, or a renamed report field) keeps the same box and
    // `onLayout` doesn't fire. Check again whenever the text changes.
    useEffect(() => {
        checkTruncation();
    }, [label, checkTruncation]);

    const animatedStyle = useAnimatedStyle(() => styles.textInputLabelTransformation(labelTranslateY, labelScale));

    return (
        <>
            {/* The label keeps its width while its font size animates, so `onLayout` doesn't fire when the label shrinks to fit or
                grows past its width. Check again once the animation settles on either size. Only labels that report truncation
                listen, so other text inputs don't pay for the reaction. */}
            {!!onTruncationChange && (
                <LabelScaleSettleListener
                    labelScale={labelScale}
                    onSettle={checkTruncation}
                />
            )}
            <Animated.Text
                numberOfLines={shouldClipToSingleLine ? 1 : undefined}
                ellipsizeMode={shouldClipToSingleLine ? 'tail' : undefined}
                onLayout={onTruncationChange ? checkTruncation : undefined}
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
        </>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default TextInputLabel;
