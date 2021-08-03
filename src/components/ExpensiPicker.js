import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import Picker from './Picker';
import styles from '../styles/styles';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Picker value */
    value: PropTypes.string,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.boolean,

    /** Picker size */
    size: PropTypes.oneOf(['normal', 'small']),
};

const defaultProps = {
    label: '',
    value: '',
    placeholder: {},
    isDisabled: false,
    size: 'normal',
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
            label, value, placeholder, isDisabled, ...pickerProps
        } = this.props;
        return (
            <View
                style={[
                    styles.expensiPickerContainer,
                    this.state.isOpen && styles.borderColorFocus,
                    isDisabled && styles.inputDisabled,
                ]}
            >
                {label && (
                    <Text style={[styles.expensiPickerLabel, styles.labelLabelSupporting]}>{label}</Text>
                )}
                <Picker
                    placeholder={placeholder}
                    value={value}
                    onOpen={() => this.setState({isOpen: true})}
                    onClose={() => this.setState({isOpen: false})}
                    disabled={isDisabled}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...pickerProps}
                />
            </View>
        );
    }
}

ExpensiPicker.propTypes = propTypes;
ExpensiPicker.defaultProps = defaultProps;

export default ExpensiPicker;
