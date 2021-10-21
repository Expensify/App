import React, {Component} from 'react';
import {TextInput} from 'react-native';

class FormInput extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            validate,
            clearErrors,
            onChange,
        } = this.props;

        return (
            <TextInput
                placeholder={'test'}
                onChangeText={onChange}
            />
        );
    }
}

// FormInput.propTypes = propTypes;
// FormInput.defaultProps = defaultProps;

export default FormInput;
