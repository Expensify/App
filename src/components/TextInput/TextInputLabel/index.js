import React, {useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './TextInputLabelPropTypes';
import CONST from '../../../CONST';

function TextInputLabel({for: inputId, label, labelTranslateY, labelScale}) {
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
            pointerEvents="none"
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            style={[styles.textInputLabel, styles.textInputLabelDesktop, styles.textInputLabelTransformation(labelTranslateY, 0, labelScale)]}
        >
            {label}
        </Animated.Text>
    );
}

TextInputLabel.displayName = 'TextInputLabel';
TextInputLabel.propTypes = propTypes;
TextInputLabel.defaultProps = defaultProps;

export default React.memo(TextInputLabel);
