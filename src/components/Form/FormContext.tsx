import {createContext} from 'react';
import type {Form} from '@src/types/form';
import type {FormOnyxKeys, InputComponentBaseProps} from './types';

type InputProps = Omit<InputComponentBaseProps, 'InputComponent' | 'inputID'>;

type RegisterInput = (inputID: FormOnyxKeys, shouldSubmitForm: boolean, inputProps: InputProps) => InputProps;
type FormContext = {
    registerInput: RegisterInput;
};

export default createContext<FormContext>({
    registerInput: () => {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
});

export type {RegisterInput};
