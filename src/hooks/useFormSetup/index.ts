import {useEffect} from 'react';
import type {View} from 'react-native';

const preventFormDefault = (event: SubmitEvent) => {
    // When enter is pressed form is submitted to action url (POST /).
    // As we are using controlled component, we need to disable it here.
    event.preventDefault();
};

const useFormSetup = (form: View | null) => {
    useEffect(() => {
        if (!form) {
            return;
        }

        // This is a safe cast because we know that form is a HTMLFormElement.
        const formElement = form as unknown as HTMLFormElement;

        // Prevent the browser from applying its own validation, which affects the email input
        formElement.setAttribute('novalidate', '');

        // Password Managers need these attributes to be able to identify the form elements properly.
        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', '/');
        formElement.addEventListener('submit', preventFormDefault);

        return () => {
            formElement.removeEventListener('submit', preventFormDefault);
        };
    }, [form]);
};

export default useFormSetup;
