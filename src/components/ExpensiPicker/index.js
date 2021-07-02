import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import Picker from '../Picker';
import styles from '../../styles/styles';

const propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    useDisabledStyles: PropTypes.boolean,
};

class ExpensiPicker extends PureComponent {
    constructor() {
        super();
        this.state = {
            isOpen: false,
        };
    }

    toggleFocus = open => this.setState({
        isOpen: open,
    })


    render() {
        const {
            label, value, placeholder, useDisabledStyles, ...pickerProps
        } = this.props;
        const {isOpen} = this.state;
        return (
            <View
                style={[
                    styles.expensiPickerContainer,
                    isOpen && styles.expensiPickerContainerOnFocus,
                    useDisabledStyles && styles.expensiPickerContainerDisabled,
                ]}
            >
                <Text style={styles.expensiPickerLabel}>{label}</Text>
                <Picker
                    placeholder={placeholder}
                    value={value}
                    onOpen={() => this.toggleFocus(true)}
                    onClose={() => this.toggleFocus(false)}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...pickerProps}
                />
            </View>
        );
    }
}

ExpensiPicker.propTypes = propTypes;
ExpensiPicker.defaultProps = {
    label: '',
    value: '',
    placeholder: {},
    useDisabledStyles: false,
};

export default ExpensiPicker;
