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
            selectedValue: this.props.defaultValue || this.props.value,
        };

        this.updateSelectedValueAndExecuteOnChange = this.updateSelectedValueAndExecuteOnChange.bind(this);
        this.executeOnCloseAndOnBlur = this.executeOnCloseAndOnBlur.bind(this);
        this.setNativeProps = this.setNativeProps.bind(this);
    }

    setNativeProps(selectedValue) {
        this.setState({selectedValue: selectedValue.value});
    }

    updateSelectedValueAndExecuteOnChange(value) {
        this.props.onInputChange(value);
        this.setState({selectedValue: value});
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
                value={this.state.selectedValue}
                Icon={() => this.props.icon(this.props.size)}
                disabled={this.props.disabled}
                fixAndroidTouchableBug
                onOpen={this.props.onOpen}
                onClose={this.props.onClose}
                ref={(node) => {
                    if (!node) {
                        return;
                    }
                    if (_.isFunction(this.props.innerRef)) {
                        this.props.innerRef(node);

                        // eslint-disable-next-line no-param-reassign
                        node.setNativeProps = this.setNativeProps;
                    }
                }}
                pickerProps={{
                    onFocus: this.props.onOpen,
                    onBlur: this.executeOnCloseAndOnBlur,
                }}
            />
        );
    }
}

BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;

export default BasePicker;
