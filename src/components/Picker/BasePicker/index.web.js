import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import {View} from 'react-native';
import _ from 'underscore';

import styles from '../../../styles/styles';
import * as basePickerPropTypes from './basePickerPropTypes';
import basePickerStyles from './basePickerStyles';

class BasePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectValue: this.props.value || this.props.defaultValue || '',
        };
    }

    componentDidMount() {
        const viewRef = this.viewRef;
        if (!viewRef) {
            return;
        }

        if (typeof this.props.innerRef !== 'function') {
            return;
        }

        // ! Picker from https://github.com/react-native-picker/picker is being used inside RNPickerSelect. Picker 'ref' prop does not work on Web
        // ! therefore it can not get '<select>' ref that Picker renders, so a pull request https://github.com/react-native-picker/picker/pull/376
        // ! has been made with a potential fix to this issue , if Picker returns a 'ref' the implementation to this file would not be neccesary.
        // An alternative is getting a View container ref. View ref will return a <div>,
        // apply 'focus()' on it will not scroll to it. Applying 'scrollIntoView(false)' will scroll to element. https://developer.mozilla.org/es/docs/Web/API/Element/scrollIntoView
        const originalFocus = viewRef.focus;
        viewRef.focus = function () {
            // Execute original focus() using apply on ref context to prevent infinite focus() call stack and preserve original focus() functionality
            originalFocus.apply(viewRef);
            viewRef.scrollIntoView(false);
        };
        this.props.innerRef(viewRef);
    }

    handleChange = (value) => {
        this.props.onChange(value);
        this.setState({selectValue: value});
    }

    render() {
        const hasError = !_.isEmpty(this.props.errorText);
        return (
            <View ref={ref => this.viewRef = ref}>
                <RNPickerSelect
                    onValueChange={this.handleChange}
                    items={this.props.items}
                    style={this.props.size === 'normal' ? basePickerStyles(this.props.disabled, hasError, this.props.focused) : styles.pickerSmall}
                    useNativeAndroidPickerStyle={false}
                    placeholder={this.props.placeholder}
                    value={this.state.selectValue}
                    Icon={() => this.props.icon(this.props.size)}
                    disabled={this.props.disabled}
                    fixAndroidTouchableBug
                    onOpen={this.props.onOpen}
                    onClose={this.props.onClose}
                    pickerProps={{
                        onFocus: this.props.onOpen,
                        onBlur: this.props.onBlur,
                    }}
                />
            </View>
        );
    }
}

BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;
BasePicker.displayName = 'BasePicker';

export default BasePicker;
