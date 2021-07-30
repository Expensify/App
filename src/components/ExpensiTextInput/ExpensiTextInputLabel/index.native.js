import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './propTypes';

class ExpensiTextInputLabel extends PureComponent {
    render() {
        const {
            label, labelTranslateX, labelTranslateY, labelScale,
        } = this.props;
        return (
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
    }
}

ExpensiTextInputLabel.propTypes = propTypes;

export default ExpensiTextInputLabel;
