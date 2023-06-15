import React from 'react';
import FormElement from '../FormElement';

function Form(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <FormElement {...props} />;
}

Form.displayName = 'Form';
export default Form;
