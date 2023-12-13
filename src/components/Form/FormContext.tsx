import {createContext} from 'react';

type FormContextType = {
    registerInput: (key: string, ref: any) => object;
};

const FormContext = createContext<FormContextType>({
    registerInput: () => {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
});

export default FormContext;
