import React from 'react';
import {View} from 'react-native';
import * as TextInputUtils from '../libs/TextInputUtils';

class Form extends React.Component {
    componentDidMount() {
        // Password Managers need these atributes to be able to identify the form elments properly.
        TextInputUtils.setBrowserAttributes(this.form, 'method', 'post');
        TextInputUtils.setBrowserAttributes(this.form, 'action', '/');
    }

    render() {
        return (
            <View
                accessibilityRole={TextInputUtils.accessibilityRoleForm}
                accessibilityAutoComplete="on"
                ref={el => this.form = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default Form;
