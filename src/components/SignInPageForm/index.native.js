import React from 'react';
import FormElement from '../FormElement';

// eslint-disable-next-line react/jsx-props-no-spreading
function Form(props) {
    return <FormElement {...props} />;
}

Form.displayName = 'Form';
export default Form;
