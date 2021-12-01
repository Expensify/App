import React, {memo} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './expensiTextInputLabelPropTypes';

const ExpensiTextInputLabel = props => (
    <Animated.Text
        style={[
            styles.expensiTextInputLabel,
            styles.expensiTextInputLabelDesktop,
            styles.expensiTextInputLabelTransformation(
                props.labelTranslateY,
                0,
                props.labelScale,
            ),
        ]}
        pointerEvents="none"
    >
        {props.label}
    </Animated.Text>
);

ExpensiTextInputLabel.propTypes = propTypes;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default memo(ExpensiTextInputLabel);
