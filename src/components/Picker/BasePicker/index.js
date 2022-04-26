import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import _ from 'underscore';

import styles from '../../../styles/styles';
import * as basePickerPropTypes from './basePickerPropTypes';
import basePickerStyles from './basePickerStyles';

class BasePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedValue: this.props.value || this.props.defaultValue,
        };

        this.updateSelectedValueAndExecuteOnChange = this.updateSelectedValueAndExecuteOnChange.bind(this);
    }

    updateSelectedValueAndExecuteOnChange(value) {
        this.props.onInputChange(value);
        this.setState({selectedValue: value});
    }

    render() {
        const hasError = !_.isEmpty(this.props.errorText);
        return (
            <RNPickerSelect
                onValueChange={this.updateSelectedValueAndExecuteOnChange}
                items={this.props.items}
                style={this.props.size === 'normal' ? basePickerStyles(this.props.disabled, hasError, this.props.focused) : styles.pickerSmall}
                useNativeAndroidPickerStyle={false}
                placeholder={this.props.placeholder}
                value={this.state.selectedValue}
                Icon={() => this.props.icon(this.props.size)}
                disabled={this.props.disabled}
                fixAndroidTouchableBug
                onOpen={this.props.onOpen}
                onClose={this.props.onClose}
                pickerProps={{
                    onFocus: this.props.onOpen,
                    onBlur: this.props.onBlur,
                    ref: this.props.innerRef,
                }}
            />
        );
    }
}

BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;

export default BasePicker;
