import {useEffect} from 'react';
import type {View} from 'react-native';

const preventFormDefault = (event: SubmitEvent) => {
    // When Enter is pressed, the form is submitted to the action URL (POST /).
    // As we are using a controlled component, we need to disable this behavior here.
    event.preventDefault();
};

const useFormSetup = (form: View | null) => {
    useEffect(() => {
        if (!form) {
            return;
        }

        // Sanity check. The form should always be an HTMLFormElement.
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        // Prevent the browser from applying its own validation, which affects the email input
        form.setAttribute('novalidate', '');

        // Password Managers need these attributes to be able to identify the form elements properly.
        form.setAttribute('method', 'post');
        form.setAttribute('action', '/');
        form.addEventListener('submit', preventFormDefault);

        return () => {
            form.removeEventListener('submit', preventFormDefault);
        };
    }, [form]);
};

export default useFormSetup;
