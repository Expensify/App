import {createContext} from 'react';
import type {Form} from '@src/types/form';
import type {InputComponentBaseProps} from './types';

type RegisterInput = (inputID: keyof Form, inputProps: InputComponentBaseProps) => InputComponentBaseProps;
type FormContext = {
    registerInput: RegisterInput;
};

export default createContext<FormContext>({
    registerInput: () => {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
});
