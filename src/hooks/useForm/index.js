import React, {useContext} from 'react';
import InputWrapper from './InputWrapper';
import FormContext from './FormContext';
import FormProvider from './FormProvider';

function useForm() {
    const formContext = useContext(FormContext);
    return {Input: InputWrapper, Form: FormProvider, formContext};
}

export default useForm;
