import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import _ from 'underscore';

import styles from '../../../styles/styles';
import * as basePickerPropTypes from './basePickerPropTypes';
import basePickerStyles from './basePickerStyles';

class BasePicker extends React.Component {
    constructor(props) {
        super(props);

        this.executeOnCloseAndOnBlur = this.executeOnCloseAndOnBlur.bind(this);
    }

    componentDidMount() {
        this.setDefaultValue();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.items === this.props.items) {
            return;
        }
        this.setDefaultValue();
    }

    setDefaultValue() {
        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        if (this.props.value || !this.props.items || this.props.items.length !== 1 || !this.props.onInputChange) {
            return;
        }
        this.props.onInputChange(this.props.items[0].key);
    }

    executeOnCloseAndOnBlur() {
        // Picker's onClose is not executed on Web and Desktop, so props.onClose has to be called with onBlur callback.
        this.props.onClose();
        this.props.onBlur();
    }

    render() {
        return (
            <RNPickerSelect
                onValueChange={this.props.onInputChange}
                items={this.props.items}
                style={this.props.size === 'normal' ? basePickerStyles(this.props.disabled) : styles.pickerSmall}
                useNativeAndroidPickerStyle={false}
                placeholder={this.props.placeholder}
                value={this.props.value}
                Icon={() => this.props.icon(this.props.size)}
                disabled={this.props.disabled}
                fixAndroidTouchableBug
                onOpen={this.props.onOpen}
                onClose={this.props.onClose}
                pickerProps={{
                    onFocus: this.props.onOpen,
                    onBlur: this.executeOnCloseAndOnBlur,
                }}
                ref={(el) => {
                    if (!_.isFunction(this.props.innerRef)) {
                        return;
                    }
                    this.props.innerRef(el);
                }}
            />
        );
    }
}

BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;

export default BasePicker;
