import {createContext} from 'react';
import type {RegisterOption} from './types';

type LHNOptionsContext = {
    registerOption: RegisterOption;
};

export default createContext<LHNOptionsContext>({
    registerOption: () => {
        throw new Error('Registered option should be wrapped inside LHNOptionsList');
    },
});
