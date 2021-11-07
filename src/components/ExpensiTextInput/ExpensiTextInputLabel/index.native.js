import React, {memo} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './expensiTextInputLabelPropTypes';

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
ExpensiTextInputLabel.propTypes = defaultProps;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default memo(ExpensiTextInputLabel);
