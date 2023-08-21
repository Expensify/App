import React from 'react';
import FormElement from '../FormElement';

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.preventFormDefault = this.preventFormDefault.bind(this);
    }

    componentDidMount() {
        if (!this.form) {
            return;
        }

        // Prevent the browser from applying its own validation, which affects the email input
        this.form.setAttribute('novalidate', '');

        // Password Managers need these attributes to be able to identify the form elements properly.
        this.form.setAttribute('method', 'post');
        this.form.setAttribute('action', '/');

        this.form.addEventListener('submit', this.preventFormDefault);
    }

    componentWillUnmount() {
        if (!this.form) {
            return;
        }

        this.form.removeEventListener('submit', this.preventFormDefault);
    }

    preventFormDefault(event) {
        // When enter is pressed form is submitted to action url (POST /).
        // As we are using controlled component, we need to disable it here.
        event.preventDefault();
    }

    render() {
        return (
            <FormElement
                ref={(el) => (this.form = el)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default Form;
