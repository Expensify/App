import React from 'react';
import {View} from 'react-native';
import {setBrowserAttributes} from '../libs/TextInputUtils';

class Form extends React.Component {
    componentDidMount() {
        setBrowserAttributes(this.form, 'method', 'post');
        setBrowserAttributes(this.form, 'action', '/');
    }

    render() {
        return (
            <View
                accessibilityRole="form"
                accessibilityAutoComplete="on"
                ref={el => this.form = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

Form.displayName = 'Form';
export default Form;
