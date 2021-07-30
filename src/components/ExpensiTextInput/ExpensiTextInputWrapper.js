import React, {PureComponent} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** Input label */
    children: PropTypes.node.isRequired,

    /** Has Label */
    hasLabel: PropTypes.bool.isRequired,

    /** On press to wrapper */
    onPress: PropTypes.func.isRequired,

    /** Is input in focus? */
    isFocused: PropTypes.bool.isRequired,

    /** Has error? */
    error: PropTypes.bool.isRequired,

    /** ExpensiTextInput. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

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

ExpensiTextInputWrapper.propTypes = propTypes;
ExpensiTextInputWrapper.defaultProps = defaultProps;

export default ExpensiTextInputWrapper;
