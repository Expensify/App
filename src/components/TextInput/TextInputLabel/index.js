import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './TextInputLabelPropTypes';

function TextInputLabel({for: inputId, label, labelTranslateY, labelScale}) {
    const styles = useThemeStyles();
    const labelRef = useRef(null);

    useEffect(() => {
        if (!inputId || !labelRef.current) {
            return;
        }
        labelRef.current.setAttribute('for', inputId);
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
TextInputLabel.propTypes = propTypes;
TextInputLabel.defaultProps = defaultProps;

export default React.memo(TextInputLabel);
