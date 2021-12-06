import React from 'react';
import BaseForm from './BaseForm';

class Form extends React.Component {
    componentDidMount() {
        if (!this.form) {
            return;
        }

        // Password Managers need these attributes to be able to identify the form elements properly.
        this.form.setNativeProps({
            method: 'post',
            action: '/',
        });
    }

    render() {
        return (
            <BaseForm
                ref={el => this.form = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default Form;
