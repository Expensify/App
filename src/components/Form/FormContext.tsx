import type {Form} from '@src/types/form';

import {createContext} from 'react';

import type {InputComponentBaseProps} from './types';

type InputProps = Omit<InputComponentBaseProps, 'InputComponent' | 'inputID'>;

type RegisterInput = (inputID: keyof Form, shouldSubmitForm: boolean, inputProps: InputProps) => InputProps;
type FormContext = {
    registerInput: RegisterInput;
    getErrorAnnouncementKey: () => number;
    getFallbackAnnouncementMessage: () => string;

    /**
     * Reports an error the input's own value is enough to decide, such as a date outside the range its calendar
     * offers. A value the input refuses to commit never reaches the form, so without this the page would have no
     * rule to write and would submit the entry in silence. An empty string withdraws the error.
     */
    setInputValidationError: (inputID: keyof Form, error: string) => void;
};

export default createContext<FormContext>({
    registerInput: () => {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
    getErrorAnnouncementKey: () => 0,
    getFallbackAnnouncementMessage: () => '',

    // Inputs are usable on their own outside a form, where the page owns its own submit and there is nothing to tell
    setInputValidationError: () => {},
});

export type {RegisterInput};
