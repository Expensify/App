import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import _ from 'underscore';

import styles from '../../../styles/styles';
import * as basePickerPropTypes from './basePickerPropTypes';
import basePickerStyles from './basePickerStyles';

class BasePicker extends React.Component {
    constructor(props) {
        super(props);

        this.pickerValue = this.props.defaultValue;

        this.updateSelectedValueAndExecuteOnChange = this.updateSelectedValueAndExecuteOnChange.bind(this);
        this.executeOnCloseAndOnBlur = this.executeOnCloseAndOnBlur.bind(this);
        this.setNativeProps = this.setNativeProps.bind(this);
    }

    /**
     * This method mimicks RN's setNativeProps method. It's exposed to Picker's ref and can be used by other components
     * to directly manipulate Picker's value when Picker is used as an uncontrolled input.
     *
     * @param {*} value
     */
    setNativeProps({value}) {
        this.pickerValue = value;
    }

    updateSelectedValueAndExecuteOnChange(value) {
        this.props.onInputChange(value);
        this.pickerValue = value;
    }

    executeOnCloseAndOnBlur() {
        // Picker's onClose is not executed on Web and Desktop, so props.onClose has to be called with onBlur callback.
        this.props.onClose();
        this.props.onBlur();
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
                value={this.props.value || this.pickerValue}
                Icon={() => this.props.icon(this.props.size)}
                disabled={this.props.disabled}
                fixAndroidTouchableBug
                onOpen={this.props.onOpen}
                onClose={this.props.onClose}
                pickerProps={{
                    onFocus: this.props.onOpen,
                    onBlur: this.executeOnCloseAndOnBlur,
                }}
                ref={(node) => {
                    if (!node || !_.isFunction(this.props.innerRef)) {
                        return;
                    }

                    this.props.innerRef(node);

                    // eslint-disable-next-line no-param-reassign
                    node.setNativeProps = this.setNativeProps;
                }}
            />
        );
    }
}

BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;

export default BasePicker;
