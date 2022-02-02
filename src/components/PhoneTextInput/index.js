import React from 'react';
import * as baseTextInputPropTypes from '../TextInput/baseTextInputPropTypes';
import TextInput from '../TextInput';
import LoginUtil from '../../libs/LoginUtil';

class PhoneTextInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            val: props.value || props.defaultValue || '',
        };
        this.setValue = this.setValue.bind(this);
    }

    setValue(val) {
        this.setState({val});
        let phoneNumber = LoginUtil.getPhoneNumberWithoutSpecialChars(val);

        if (this.props.VBAPhone) {
            if (/^\+1/.test(phoneNumber)) {
                phoneNumber = phoneNumber.replace(/^\+?1|\|1|\D/, '');
            }
        }
        this.props.onChangeText(phoneNumber);
    }

    render() {
        return (
            <TextInput
                ref={this.props.forwardedRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                value={this.state.val}
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
