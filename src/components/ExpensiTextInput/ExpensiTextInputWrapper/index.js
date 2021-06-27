import React, {PureComponent} from 'react';
import {TouchableWithoutFeedback, View, Animated} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    /** Input label */
    children: PropTypes.node.isRequired,

    /** Label */
    label: PropTypes.string,

    /** On press to wrapper */
    onPress: PropTypes.func.isRequired,

    /** Is input in focus? */
    isFocused: PropTypes.bool.isRequired,

    /** Has error? */
    error: PropTypes.bool.isRequired,

    /** Label vertical translate */
    labelTranslateY: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Label horizontal translate */
    labelTranslateX: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Label scale */
    labelScale: PropTypes.instanceOf(Animated.Value).isRequired,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    containerStyles: [],
    label: '',
};

class ExpensiTextInputWrapper extends PureComponent {
    render() {
        const {
            children, onPress, containerStyles, isFocused, error, label, labelTranslateY, labelTranslateX, labelScale,
        } = this.props;

        const hasLabel = !!label.length;
        return (
            <View style={[styles.expensiTextInputWrapper, ...containerStyles]}>
                <TouchableWithoutFeedback onPress={onPress}>
                    <View
                        style={[
                            styles.expensiTextInputContainer,
                            !hasLabel && styles.expensiTextInputContainerWithoutLabel,
                            isFocused && styles.expensiTextInputContainerOnFocus,
                            error && styles.expensiTextInputContainerOnError,
                            {
                                display: 'flex',
                                flexDirection: 'column',
                                height: 100,
                            },
                        ]}
                    >
                        {hasLabel > 0 && (
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
                        )}
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
