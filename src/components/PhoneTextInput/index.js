import React from 'react';
import * as baseTextInputPropTypes from '../TextInput/baseTextInputPropTypes';
import TextInput from '../TextInput';
import * as LoginUtils from '../../libs/LoginUtils';

class PhoneTextInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || props.defaultValue || '',
        };
        this.setValue = this.setValue.bind(this);
    }

    setValue(value) {
        this.setState({value});
        this.props.onChangeText(LoginUtils.getPhoneNumberWithoutSpecialChars(value));
    }

    render() {
        return (
            <TextInput
                ref={this.props.forwardedRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                value={this.state.value}
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
