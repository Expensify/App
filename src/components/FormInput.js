import React, {Component} from 'react';
import {TextInput} from 'react-native';

class FormInput extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TextInput
                placeholder={'test'}
                onChangeText={this.props.onChange}
            />
        );
    }
}

// FormInput.propTypes = propTypes;
// FormInput.defaultProps = defaultProps;

FormInput.displayName = 'FormInput';
export default FormInput;
