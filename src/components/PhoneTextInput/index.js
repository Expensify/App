import React from 'react';
import * as baseTextInputPropTypes from '../TextInput/baseTextInputPropTypes';
import TextInput from '../TextInput';
import LoginUtil from '../../libs/LoginUtil';

class PhoneTextInput extends React.Component {
    constructor(props) {
        super(props);

        this.value = props.value || props.defaultValue || '';
        this.setValue = this.setValue.bind(this);
    }

    setValue(val) {
        this.value = val;
        const phoneNumber = LoginUtil.getPhoneNumberWithoutSpecialChars(val);
        this.props.onChangeText(phoneNumber);
    }

    render() {
        return (
            <TextInput
                ref={this.props.forwardedRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                value={this.value}
                onChangeText={this.setValue}
            />
        );
    }
}

PhoneTextInput.propTypes = baseTextInputPropTypes.propTypes;
PhoneTextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <PhoneTextInput {...props} forwardedRef={ref} />
));
