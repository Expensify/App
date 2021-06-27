import React, {PureComponent} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import expensiTextInputWrapperPropTypes from './ExpensiTextInputWrapperPropTypes';
import styles from '../../../styles/styles';

const defaultProps = {
    containerStyles: [],
};

class ExpensiTextInputWrapper extends PureComponent {
    render() {
        const {
            children, onPress, containerStyles, isFocused, error, hasLabel,
        } = this.props;

        return (
            <View style={[styles.expensiTextInputWrapper, ...containerStyles]}>
                <TouchableWithoutFeedback onPress={onPress}>
                    <View
                        style={[
                            styles.expensiTextInputContainer,
                            !hasLabel && styles.expensiTextInputContainerWithoutLabel,
                            isFocused && styles.expensiTextInputContainerOnFocus,
                            error && styles.expensiTextInputContainerOnError,
                        ]}
                    >
                        {children}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

ExpensiTextInputWrapper.propTypes = expensiTextInputWrapperPropTypes;
ExpensiTextInputWrapper.defaultProps = defaultProps;

export default ExpensiTextInputWrapper;
