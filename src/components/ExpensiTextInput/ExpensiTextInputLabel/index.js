import React, {memo} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './propTypes';

const ExpensiTextInputLabel = ({
    label,
    labelTranslateY,
    labelTranslateX,
    labelScale,
}) => (
    <Animated.Text
        style={[
            styles.expensiTextInputLabel,
            styles.expensiTextInputLabelDesktop,
            styles.expensiTextInputLabelTransformation(
                labelTranslateY,
                labelTranslateX,
                labelScale,
            ),
        ]}
<<<<<<< HEAD
=======
        pointerEvents="none"
>>>>>>> 1ace10c8b (Merge pull request #5858 from AlfredoAlc/alfredo-fix-textinput-area)
    >
        {label}
    </Animated.Text>
);

ExpensiTextInputLabel.propTypes = propTypes;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default memo(ExpensiTextInputLabel);
