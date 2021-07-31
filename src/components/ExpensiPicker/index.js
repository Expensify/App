import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import Picker from '../Picker';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './propTypes';

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
                    isDisabled && styles.borderColorDanger,
                ]}
            >
                {label && (
                    <Text style={styles.expensiPickerLabel}>{label}</Text>
                )}
                <Picker
                    placeholder={placeholder}
                    value={value}
                    onOpen={() => this.setState({isOpen: true})}
                    onClose={() => this.setState({isOpen: false})}
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
