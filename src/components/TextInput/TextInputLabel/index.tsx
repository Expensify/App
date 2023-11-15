import React, {useEffect, useRef} from 'react';
import {Animated, Text} from 'react-native';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import TextInputLabelProps from './types';

function TextInputLabel({for: inputId = '', label, labelTranslateY, labelScale}: TextInputLabelProps) {
    const labelRef = useRef<Text>(null);

    useEffect(() => {
        if (!inputId || !labelRef.current) {
            return;
        }
        (labelRef.current as unknown as HTMLFormElement).setAttribute('for', inputId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.Text
            ref={labelRef}
            role={CONST.ACCESSIBILITY_ROLE.TEXT}
            style={[styles.textInputLabel, styles.textInputLabelDesktop, styles.textInputLabelTransformation(labelTranslateY, 0, labelScale), styles.pointerEventsNone]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';

export default React.memo(TextInputLabel);
