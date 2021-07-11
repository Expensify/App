import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import Picker from '../Picker';
import styles from '../../styles/styles';
import propTypes from './propTypes';
import defaultProps from './defaultProps';

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
ExpensiPicker.defaultProps = defaultProps;

export default ExpensiPicker;
