import React, {memo} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './propTypes';

const ExpensiTextInputLabel = ({
    label,
    labelTranslateX,
    labelTranslateY,
    labelScale,
}) => (
    <Animated.Text
        style={[
            styles.expensiTextInputLabel,
            styles.expensiTextInputLabelTransformation(
                labelTranslateY,
                labelTranslateX,
                labelScale,
            ),
        ]}
    >
        {label}
    </Animated.Text>
);

ExpensiTextInputLabel.propTypes = propTypes;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default memo(ExpensiTextInputLabel);
