import React, {useEffect, useRef} from 'react';
import FormElement from '../FormElement';

function Form(props) {
    const form = useRef(null);

    const preventFormDefault = (event) => {
        // When enter is pressed form is submitted to action url (POST /).
        // As we are using controlled component, we need to disable it here.
        event.preventDefault();
    };

    useEffect(() => {
        const formCurrent = form.current;

        if (!formCurrent) {
            return;
        }

        // Prevent the browser from applying its own validation, which affects the email input
        formCurrent.setAttribute('novalidate', '');

        formCurrent.setAttribute('method', 'post');
        formCurrent.setAttribute('action', '/');
        formCurrent.addEventListener('submit', preventFormDefault);

        return () => {
            if (!formCurrent) {
                return;
            }
            formCurrent.removeEventListener('submit', preventFormDefault);
        };
    }, []);

    return (
        <FormElement
            ref={form}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

Form.displayName = 'Form';

export default Form;
