import React from 'react';
import Str from 'expensify-common/lib/str';
import * as phoneTextnputPropTypes from './phoneTextnputPropTypes';
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
        const formattedValue = LoginUtil.getPhoneNumberWithoutSpecialChars(val);
        Str.result(this.props.onChangeText, formattedValue);
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                value={this.value}
                onChangeText={this.setValue}

            />
        );
    }
}

PhoneTextInput.propTypes = phoneTextnputPropTypes.propTypes;
PhoneTextInput.defaultProps = phoneTextnputPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <PhoneTextInput {...props} forwardedRef={ref} />
));
