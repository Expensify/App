import {createContext} from 'react';
import type {Form} from '@src/types/form';
import type {InputComponentBaseProps} from './types';

type InputProps = Omit<InputComponentBaseProps, 'InputComponent' | 'inputID'>;

type RegisterInput = (inputID: keyof Form, shouldSubmitForm: boolean, inputProps: InputProps) => InputProps;
type FormContext = {
    registerInput: RegisterInput;
    errorAnnouncementKey: number;
    fallbackAnnouncementMessage: string;
};

export default createContext<FormContext>({
    registerInput: () => {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
    errorAnnouncementKey: 0,
    fallbackAnnouncementMessage: '',
});

export type {RegisterInput};
