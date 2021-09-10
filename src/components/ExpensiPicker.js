import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import Picker from './Picker';
import styles from '../styles/styles';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,
};

const defaultProps = {
    label: '',
    isDisabled: false,
    errorText: '',
    hasError: false,
};

class ExpensiPicker extends PureComponent {
    constructor() {
        super();
        this.state = {
            isOpen: false,
        };
    }

    render() {
        const {
            errorText,
            hasError,
            label,
            isDisabled,
            ...pickerProps
        } = this.props;
        return (
            <>
                <View
                    style={[
                        styles.expensiPickerContainer,
                        this.state.isOpen && styles.borderColorFocus,
                        isDisabled && styles.inputDisabled,
                        (errorText || hasError) && styles.borderColorDanger,
                    ]}
                >
                    {label && (
                        <Text style={[styles.expensiPickerLabel, styles.textLabelSupporting]}>{label}</Text>
                    )}
                    <Picker
                        onOpen={() => this.setState({isOpen: true})}
                        onClose={() => this.setState({isOpen: false})}
                        disabled={isDisabled}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...pickerProps}
                    />
                </View>
                {Boolean(errorText) && (
                    <Text style={[styles.formError, styles.mt1]}>{errorText}</Text>
                )}
            </>
        );
    }
}

ExpensiPicker.propTypes = propTypes;
ExpensiPicker.defaultProps = defaultProps;

export default ExpensiPicker;
