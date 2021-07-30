import React, {PureComponent} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import {propTypes, defaultProps} from './propTypes';
import styles from '../../../styles/styles';

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

ExpensiTextInputWrapper.propTypes = propTypes;
ExpensiTextInputWrapper.defaultProps = defaultProps;

export default ExpensiTextInputWrapper;
