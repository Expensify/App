import React, {memo} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './expensiTextInputLabelPropTypes';

const ExpensiTextInputLabel = props => (
    <Animated.Text
        style={[
            styles.expensiTextInputLabel,
            styles.expensiTextInputLabelTransformation(
                props.labelTranslateY,
                props.labelTranslateX,
                props.labelScale,
            ),
        ]}
    >
        {props.label}
    </Animated.Text>
);

ExpensiTextInputLabel.propTypes = propTypes;
ExpensiTextInputLabel.propTypes = defaultProps;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default memo(ExpensiTextInputLabel);
